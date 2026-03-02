# Production Readiness Guide

## Local Run Modes

### Normal dev

```bash
./scripts/dev-normal.sh
```

- Fastest startup.
- Good default when disk pressure is low.

### Lean dev

```bash
./scripts/dev-lean.sh
```

- Uses temporary process cache paths.
- Runs `clean-heavy` automatically when the server exits.
- Best daily mode when disk space is constrained.

## Cleanup Commands

### Targeted cleanup (heavy artifacts only)

```bash
./scripts/clean-heavy.sh
```

Removes heavy build/runtime directories without touching dependency caches.

### Full local cleanup (all reproducible caches)

```bash
./scripts/clean-all-local.sh
```

Includes `clean-heavy` and removes reproducible local caches that can be rebuilt.

## Disk Measurement

Capture before/after snapshots:

```bash
./scripts/measure-disk.sh
```

## Quality Gates (No-Go Criteria)

Run canonical checks:

```bash
bash .codex/scripts/run_verify_commands.sh
node scripts/ci/require-tests-and-docs.mjs
```

No-go conditions:

- Any verify command fails.
- Policy check fails (production changes without tests/docs updates).
- Post-deploy smoke check fails.

## GitHub Pages Release Flow

Workflow: `.github/workflows/deploy-pages.yml`

1. Build static artifact (`dist/`) using `scripts/ci/build-pages.mjs`.
2. Upload artifact with `actions/upload-pages-artifact`.
3. Deploy with `actions/deploy-pages`.
4. Run post-deploy smoke (`scripts/ci/smoke-pages.mjs`).

## Rollback Runbook

If a deployment is unhealthy:

1. Identify the last known good commit on `main`.
2. Re-run Pages deployment from that commit (workflow dispatch).
3. Confirm smoke checks pass on the restored deployment URL.

## Troubleshooting

- If service worker updates appear stale, hard refresh once after deployment.
- If PWA icons are missing, verify `icon-192.png` and `icon-512.png` exist at repo root.
- If checks fail locally, run verify commands in order to isolate first failing step.
