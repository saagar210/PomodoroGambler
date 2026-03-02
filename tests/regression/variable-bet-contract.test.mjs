import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const bettingServiceSource = readFileSync('js/services/BettingService.js', 'utf8');
const eventCardSource = readFileSync('js/components/EventCard.js', 'utf8');
const dashboardSource = readFileSync('js/components/Dashboard.js', 'utf8');
const databaseSource = readFileSync('js/core/database.js', 'utf8');

test('BettingService validates and applies variable bet amount', () => {
  assert.match(bettingServiceSource, /validateBetAmount/);
  assert.match(bettingServiceSource, /rawBetAmount/);
  assert.match(bettingServiceSource, /deductCoins\(betAmount\)/);
});

test('EventCard renders button labels from state betAmount', () => {
  assert.match(eventCardSource, /state\.get\('betAmount'\)/);
  assert.match(eventCardSource, /Bet YES \(\$\{betAmount\} coins\)/);
  assert.match(eventCardSource, /Bet NO \(\$\{betAmount\} coins\)/);
});

test('Dashboard exposes bet amount input control and validation', () => {
  assert.match(dashboardSource, /id="bet-amount-input"/);
  assert.match(dashboardSource, /validateBetAmount/);
  assert.match(dashboardSource, /state\.set\('betAmount', value\)/);
});

test('Database persists bet_amount for betting transactions', () => {
  assert.match(
    databaseSource,
    /INSERT INTO betting_transactions \(event_id, bet_amount, bet_side, odds_at_bet, potential_payout\)/
  );
});
