import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('js/components/PomodoroTimer.js', 'utf8');

test('paused-state stop button is handled by delegated listener (no inline onclick)', () => {
  assert.doesNotMatch(
    source,
    /onclick="timerService\.stopSession\(\)"/,
    'Inline onclick should not be used for module-scoped timerService.',
  );
  assert.match(source, /const stopBtn = e\.target\.closest\('\.timer-stop-btn'\)/);
  assert.match(source, /timerService\.stopSession\(\);/);
});

test('completion sound does not rely on missing audio asset files', () => {
  assert.doesNotMatch(source, /timer-complete\.mp3/);
  assert.match(source, /AudioContext/);
});

test('duration selection updates timer state for keyboard-start parity', () => {
  assert.match(source, /state\.set\('timer\.duration', this\.selectedDuration\)/);
  assert.match(source, /state\.set\('timer\.duration', duration\)/);
});
