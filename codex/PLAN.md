# Delta Plan

## A) Executive Summary

### Current state (repo-grounded)
- App is a browser-only vanilla JS SPA with local persistence via sql.js + IndexedDB. (`js/main.js`, `js/core/database.js`, `js/core/storage.js`)
- Betting flow supports only placement; bets remain pending indefinitely and events remain active forever. (`js/services/BettingService.js`, `js/core/database.js`, `js/components/History.js`)
- Database schema already includes outcome-related fields (`betting_events.outcome`, `betting_transactions.outcome/winnings/net_profit/resolved_at`) but no resolution write path is implemented. (`js/core/database.js`)
- History UI displays transaction outcome but provides no mechanism to resolve events. (`js/components/History.js`)
- Existing runtime test harness is partly unreliable: `node test-runner.js` fails one timer check because boundary condition setup never crosses grace period. (`test-runner.js`)

### Key risks
- Introducing event resolution can incorrectly credit balance if payout math or idempotency checks are wrong.
- Updating database write paths must keep async save ordering intact.
- UI action wiring can accidentally trigger duplicate resolutions.
- Any change to stats display semantics can conflict with existing expectations.

### Improvement themes (priority)
1. Implement event resolution + payout settlement using existing schema and services.
2. Add safe UI controls in History to resolve pending events (YES/NO) with feedback.
3. Stabilize verification baseline by correcting the broken timer check in `test-runner.js`.
4. Update docs and codex logs for auditable interruption/resume.

## B) Constraints & Invariants (Repo-derived)

### Explicit invariants
- Fixed bet amount remains 40 coins.
- All data remains local; no backend/API added.
- Async DB writes must persist via `await database.save()` chain.
- Existing tabs and primary flows (Dashboard, Timer, History) remain intact.

### Implicit inferred invariants
- One event resolution should settle all pending bets for that event once.
- Resolved events should no longer appear in active event listings.
- Balance updates must emit `balance:updated` for UI sync.

### Non-goals
- No multi-user support.
- No external market integration.
- No broad refactor of state/event bus architecture.

## C) Proposed Changes by Theme

### Theme 1: Event resolution + settlement
- Current: placement only; no resolving method.
- Proposed: add DB + service methods to resolve an event (`yes`/`no`) and settle all pending transactions atomically in one service call.
- Why: closes product loop and enables winnings to be realized.
- Tradeoffs: synchronous settlement loop is simpler and safer than a bulk SQL expression; slight performance cost but trivial at current scale.
- Scope: include event outcome, transaction outcomes, net profit/winnings, and balance credit.
- Migration: no schema change required; use existing columns.

### Theme 2: History UI controls for resolution
- Current: passive display of pending outcomes.
- Proposed: for pending transactions, render `Resolve YES`/`Resolve NO` controls that call service and re-render.
- Why: creates usable path for single-user event settlement without adding new pages.
- Tradeoffs: manual/admin-like UX, but minimal disruption.
- Scope: History tab only.

### Theme 3: Verification baseline repair
- Current: baseline test script has one incorrect timer assertion setup.
- Proposed: adjust test setup to exceed grace period by one second.
- Why: enables trustworthy baseline and final verification.

## D) File/Module Delta (Exact)

### ADD
- `codex/SESSION_LOG.md` – chronological step log.
- `codex/DECISIONS.md` – design choices and alternatives.
- `codex/CHECKPOINTS.md` – resumable checkpoints.
- `codex/CHANGELOG_DRAFT.md` – draft release notes.

### MODIFY
- `js/core/database.js` – event resolution read/write methods.
- `js/services/BettingService.js` – resolve + settle orchestration.
- `js/services/HistoryService.js` – optional event resolution helper pass-through.
- `js/components/History.js` – UI actions and status updates.
- `styles/components.css` – minimal styles for resolution action buttons/status badges.
- `test-runner.js` – repair timer test boundary.
- `README.md` and/or `QUICKSTART.md` – document event resolution behavior.

### REMOVE/DEPRECATE
- None.

### Boundary rules
- UI components may call services only (no direct DB writes from UI).
- Settlement math resides in service/database layer, not in component templates.

## E) Data Models & API Contracts (Delta)

### Current definitions
- DB schema in `js/core/database.js`; transaction model in `js/models/Transaction.js`.

### Proposed contract changes
- New service API: `bettingService.resolveEvent(eventId, winningSide)`.
- DB APIs:
  - `resolveEvent(eventId, winningSide)`
  - `getPendingTransactionsForEvent(eventId)`
  - `resolveTransaction(transactionId, outcome, winnings, netProfit)`

### Compatibility
- Backward compatible with existing saved data; fields already exist.
- Existing displays continue to work; pending values transition to won/lost after settlement.

### Migration/versioning
- No migration needed.

## F) Implementation Sequence (Dependency-Explicit)

1. **Step 1: Codex artifacts + baseline docs**
   - Files: `codex/*.md`
   - Preconditions: repo readable.
   - Verify: file creation + baseline commands recorded.
   - Rollback: remove `codex/` artifacts.

2. **Step 2: Repair baseline test script**
   - Files: `test-runner.js`
   - Dependency: Step 1 complete.
   - Verify: `node test-runner.js` passes.
   - Rollback: revert test file.

3. **Step 3: Add DB settlement methods** (risky: persistence writes)
   - Files: `js/core/database.js`
   - Verify: syntax check + targeted call path smoke (script-level).
   - Rollback: revert DB file.

4. **Step 4: Add service-level resolve orchestration**
   - Files: `js/services/BettingService.js`, `js/services/HistoryService.js`
   - Verify: syntax + `node test-runner.js`.
   - Rollback: revert service files.

5. **Step 5: Add History UI controls + styling + docs**
   - Files: `js/components/History.js`, `styles/components.css`, docs
   - Verify: syntax + runtime test + browser screenshot smoke.
   - Rollback: revert component/style/doc files.

6. **Step 6: Full verification + changelog**
   - Files: `codex/VERIFICATION.md`, `codex/CHANGELOG_DRAFT.md`
   - Verify: full command set green.
   - Rollback: n/a docs only.

## G) Error Handling & Edge Cases
- Invalid winning side → emit service error event and return failure.
- Already resolved/inactive event → prevent duplicate settlement.
- No pending bets for event → mark event resolved without balance change.
- Settlement credit failure path → fail operation and emit error toast.

## H) Integration & Testing Strategy
- Unit-like script verification: `node test-runner.js`.
- Syntax gate: `node --check` across JS tree.
- Browser smoke test via local server + screenshot after UI changes.
- Definition of Done:
  - Event can be resolved from History.
  - Pending bets become won/lost.
  - Balance increases for winners.
  - Resolved event no longer active for new bets.

## I) Assumptions & Judgment Calls
- Assumption: manual event resolution is acceptable for single-user product.
- Assumption: bet payouts should floor to integer coins for balance updates.
- Judgment call: reuse existing schema instead of migration.
- Alternative rejected: adding a new admin tab (higher UX and code footprint).
