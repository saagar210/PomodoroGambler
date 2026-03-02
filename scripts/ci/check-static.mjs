import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const JS_ROOT = join(ROOT, 'js');
const REQUIRED_PATHS = [
  'index.html',
  'manifest.json',
  'service-worker.js',
  'icon-192.png',
  'icon-512.png',
  'js/main.js',
  'openapi/openapi.generated.json',
  '.github/workflows/deploy-pages.yml',
];

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, acc);
      continue;
    }
    if (fullPath.endsWith('.js')) {
      acc.push(fullPath);
    }
  }
  return acc;
}

for (const relPath of REQUIRED_PATHS) {
  try {
    statSync(join(ROOT, relPath));
  } catch {
    console.error(`Missing required file: ${relPath}`);
    process.exit(1);
  }
}

const jsFiles = walk(JS_ROOT);
if (jsFiles.length === 0) {
  console.error('No JavaScript files found under js/');
  process.exit(1);
}

for (const jsFile of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', jsFile], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(`Syntax check failed: ${jsFile}`);
    process.stderr.write(result.stderr || result.stdout);
    process.exit(1);
  }
}

const manifestRaw = readFileSync(join(ROOT, 'manifest.json'), 'utf8');
JSON.parse(manifestRaw);

const openapiRaw = readFileSync(join(ROOT, 'openapi/openapi.generated.json'), 'utf8');
JSON.parse(openapiRaw);

console.log(`Static checks passed (${jsFiles.length} JS files syntax-checked).`);
