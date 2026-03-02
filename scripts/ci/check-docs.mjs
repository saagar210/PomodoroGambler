import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

const read = (relPath) => readFileSync(join(ROOT, relPath), 'utf8');

const readme = read('README.md');
const verifyCommands = read('.codex/verify.commands');
const openapi = JSON.parse(read('openapi/openapi.generated.json'));
const requiredDocPaths = [
  'docs/PRODUCTION_READINESS.md',
  'docs/TESTING_POLICY.md',
  'docs/CLOSEOUT.md',
];

const requiredReadmeSections = [
  '## Getting Started',
  '## Dev Modes and Cleanup',
  '### Normal Dev',
  '### Lean Dev',
  '### Cleanup Commands',
];

for (const heading of requiredReadmeSections) {
  if (!readme.includes(heading)) {
    console.error(`README is missing required section: ${heading}`);
    process.exit(1);
  }
}

const placeholderPatterns = [
  'Replace these commands with your repo',
  'npm run lint',
  'npm run test',
  'npm run docs:check',
];

for (const pattern of placeholderPatterns) {
  if (verifyCommands.includes(pattern)) {
    console.error(`Verify contract still contains placeholder content: "${pattern}"`);
    process.exit(1);
  }
}

if (!openapi.openapi || !openapi.info) {
  console.error('openapi/openapi.generated.json is missing required OpenAPI top-level fields.');
  process.exit(1);
}

for (const docPath of requiredDocPaths) {
  try {
    statSync(join(ROOT, docPath));
  } catch {
    console.error(`Missing required doc: ${docPath}`);
    process.exit(1);
  }
}

console.log('Docs checks passed.');
