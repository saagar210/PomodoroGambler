import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const databaseSource = readFileSync('js/core/database.js', 'utf8');
const eventCreationSource = readFileSync('js/services/EventCreationService.js', 'utf8');
const eventModelSource = readFileSync('js/models/BettingEvent.js', 'utf8');

test('betting_events schema defines is_custom in base schema', () => {
  assert.match(
    databaseSource,
    /CREATE TABLE betting_events[\s\S]*is_custom INTEGER DEFAULT 0[\s\S]*is_active INTEGER DEFAULT 1/,
    'Expected createSchema() to include is_custom for fresh databases.',
  );
});

test('custom event delete guard uses strict numeric check', () => {
  assert.match(
    eventCreationSource,
    /Number\(event\.is_custom\) !== 1/,
    'Expected delete guard to treat non-1 values as non-custom events.',
  );
});

test('BettingEvent model maps is_custom to isCustom', () => {
  assert.match(
    eventModelSource,
    /this\.isCustom = Number\(data\.is_custom\) === 1/,
    'Expected BettingEvent to expose isCustom from database rows.',
  );
});
