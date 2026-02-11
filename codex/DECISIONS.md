# Codex Decisions Log

## 2026-02-10
1. **Implement event resolution using existing schema**
   - Rationale: `betting_events` and `betting_transactions` already carry outcome fields; no migration needed.
   - Alternative rejected: introducing a new table for resolutions.

2. **Use manual resolution controls in History tab**
   - Rationale: smallest UX delta and easiest discoverability for currently pending bets.
   - Alternative rejected: new dedicated admin/settings page (larger scope).

3. **Repair failing baseline test before feature work**
   - Rationale: keep verification healthy during iterative implementation.

4. **Settlement payout uses `Math.floor(potential_payout)`**
   - Rationale: balance is integer coin-based across existing UI and schema.
   - Alternative rejected: storing/crediting fractional coin balances.

5. **Resolve controls rendered per pending transaction row**
   - Rationale: minimal intrusive UI; allows immediate resolution from existing workflow.
   - Alternative rejected: batched controls detached from rows.
