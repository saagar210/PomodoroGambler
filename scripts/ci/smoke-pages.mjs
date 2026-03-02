const baseUrlRaw = process.env.SMOKE_BASE_URL;

if (!baseUrlRaw) {
  console.error('SMOKE_BASE_URL is required.');
  process.exit(1);
}

const baseUrl = new URL(baseUrlRaw);
const checks = ['.', 'manifest.json', 'service-worker.js'];

for (const path of checks) {
  const url = new URL(path, baseUrl);
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Post-deploy smoke failed for ${url}: HTTP ${response.status}`);
    process.exit(1);
  }
}

console.log(`Post-deploy smoke checks passed for ${baseUrl}`);
