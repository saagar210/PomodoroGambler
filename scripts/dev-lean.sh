#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-8000}"

LEAN_ROOT="$ROOT_DIR/.tmp/lean-dev"
mkdir -p "$LEAN_ROOT"

RUNTIME_TMP="$(mktemp -d "$LEAN_ROOT/tmp.XXXXXX")"
RUNTIME_CACHE="$(mktemp -d "$LEAN_ROOT/cache.XXXXXX")"

cleanup() {
  rm -rf -- "$RUNTIME_TMP" "$RUNTIME_CACHE"
  "$ROOT_DIR/scripts/clean-heavy.sh" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

cd "$ROOT_DIR"
export TMPDIR="$RUNTIME_TMP"
export TMP="$RUNTIME_TMP"
export TEMP="$RUNTIME_TMP"
export XDG_CACHE_HOME="$RUNTIME_CACHE"
export PYTHONDONTWRITEBYTECODE=1

echo "Starting AuraFlow lean mode on http://localhost:${PORT}"
echo "Ephemeral runtime dirs:"
echo "  TMPDIR=$RUNTIME_TMP"
echo "  XDG_CACHE_HOME=$RUNTIME_CACHE"
echo "Lean cleanup runs automatically on exit."

python3 -m http.server "$PORT"
