# Changelog Draft

## Unreleased

### Theme: Event Resolution & Settlement
- Added event resolution pipeline in persistence and service layers to settle pending bets as won/lost.
- Resolving an event now:
  - marks event outcome and deactivates it,
  - settles all pending bets on that event,
  - computes `winnings` and `net_profit`,
  - credits aggregate winner payouts to balance.

### Theme: History UX
- Added `Resolve YES` / `Resolve NO` controls in Betting History for pending transactions.
- Added status badge mapping for `pending`, `won`, and `lost` outcomes.
- Added toast feedback for resolution success/failure.

### Theme: Verification Reliability
- Repaired timer interruption test boundary in `test-runner.js`; runtime harness now passes 6/6 deterministically.

### Theme: Session Auditability
- Added codex artifacts (`PLAN`, `SESSION_LOG`, `DECISIONS`, `CHECKPOINTS`, `VERIFICATION`, `CHANGELOG_DRAFT`) for interruption-safe continuation.
