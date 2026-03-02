import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const randomPort = () => String(20000 + Math.floor(Math.random() * 20000));
const PORT = process.env.SMOKE_PORT || randomPort();
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHECK_PATHS = ['/', '/manifest.json', '/service-worker.js'];
const STARTUP_TIMEOUT_MS = 6000;

const server = spawn('python3', ['-m', 'http.server', PORT], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetch(`${BASE_URL}/`, { method: 'GET' });
      if (response.ok) return;
    } catch {
      // Keep polling until timeout.
    }
    await delay(200);
  }
  throw new Error(`HTTP server did not become ready within ${STARTUP_TIMEOUT_MS}ms`);
}

try {
  await waitForServer();

  for (const path of CHECK_PATHS) {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) {
      throw new Error(`Smoke check failed for ${path}: HTTP ${response.status}`);
    }
  }

  console.log(`HTTP smoke checks passed on ${BASE_URL}`);
} catch (error) {
  console.error(error.message);
  if (serverOutput.trim()) {
    console.error(serverOutput.trim());
  }
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
}
