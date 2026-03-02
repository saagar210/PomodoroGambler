import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

const pathsToCopy = [
  'index.html',
  'manifest.json',
  'service-worker.js',
  'icon-192.png',
  'icon-512.png',
  'js',
  'styles',
  'lib',
  'openapi',
];

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

for (const relPath of pathsToCopy) {
  const source = join(ROOT, relPath);
  if (!existsSync(source)) {
    console.error(`Missing build input: ${relPath}`);
    process.exit(1);
  }
  cpSync(source, join(DIST, relPath), { recursive: true });
}

console.log('Pages build complete: dist/');
