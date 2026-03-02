import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('js/services/DataExportService.js', 'utf8');

test('bets export query aliases to snake_case fields used in models', () => {
  assert.match(
    source,
    /SELECT bt\.\*, be\.title as event_title, be\.category as event_category/,
    'Expected export query aliases to use event_title/event_category.',
  );
});

test('sessions and bets CSV mapping use snake_case db field names', () => {
  assert.match(source, /s\.created_at/);
  assert.match(source, /s\.duration_minutes/);
  assert.match(source, /s\.coins_earned/);
  assert.match(source, /b\.created_at/);
  assert.match(source, /b\.bet_side/);
  assert.match(source, /b\.bet_amount/);
  assert.match(source, /b\.odds_at_bet/);
  assert.match(source, /b\.potential_payout/);
});

test('deleteAllData resets coin_balance using schema-valid column names', () => {
  assert.ok(
    source.includes("UPDATE coin_balance SET balance = 100, last_updated = datetime(\\'now\\') WHERE id = 1"),
    'Expected deleteAllData to reset the balance column and timestamp.',
  );
  assert.match(source, /await this\.database\.save\(\)/);
});
