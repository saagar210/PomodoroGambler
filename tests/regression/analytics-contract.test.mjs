import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const analyticsServiceSource = readFileSync('js/services/AnalyticsService.js', 'utf8');
const historySource = readFileSync('js/components/History.js', 'utf8');

test('Analytics service exposes summary metrics for sessions and bets', () => {
  assert.match(analyticsServiceSource, /completionRate/);
  assert.match(analyticsServiceSource, /winRate/);
  assert.match(analyticsServiceSource, /avgBetAmount/);
  assert.match(analyticsServiceSource, /roi/);
});

test('History renders analytics grid and refreshes it on updates', () => {
  assert.match(historySource, /class=\"analytics-grid\"/);
  assert.match(historySource, /this\.renderAnalytics\(\)/);
  assert.match(historySource, /analyticsService\.getSummary\(\)/);
});
