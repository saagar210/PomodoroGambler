# Testing and Reliability Policy

## Test Layers

1. Static integrity checks (`scripts/ci/check-static.mjs`)
2. Regression contract tests (`tests/regression/*.test.mjs`)
3. Local HTTP smoke checks (`scripts/ci/smoke-http.mjs`)
4. Documentation/contract checks (`scripts/ci/check-docs.mjs`)
5. Post-deploy Pages smoke (`scripts/ci/smoke-pages.mjs`)

## Flake Handling

- Keep deterministic tests in canonical verify commands.
- If a flaky test appears, isolate root cause before re-adding it to canonical verify.
- Avoid hidden retries in core local verify flow.
- CI deploy smoke is allowed one rerun at workflow level, but persistent flake is a release blocker.

## Release Gate Standard

- No unresolved P0/P1 defects.
- Verify contract must pass locally and in CI.
- Deployment smoke must pass on the live Pages URL.
