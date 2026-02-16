#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

"$ROOT_DIR/scripts/clean-heavy.sh"

# Reproducible caches and local environments.
FULL_CLEAN_PATHS=(
  ".cache"
  ".pytest_cache"
  ".mypy_cache"
  ".ruff_cache"
  ".nyc_output"
  "node_modules/.cache"
  "__pycache__"
  ".venv"
  "venv"
)

removed_any=0

for path in "${FULL_CLEAN_PATHS[@]}"; do
  if [ -e "$path" ]; then
    rm -rf -- "$path"
    echo "Removed $path"
    removed_any=1
  fi
done

# Recursive cleanup for language caches inside source tree.
if find . -type d -name "__pycache__" -prune | grep -q .; then
  find . -type d -name "__pycache__" -prune -exec rm -rf {} +
  echo "Removed nested __pycache__ directories"
  removed_any=1
fi

if [ "$removed_any" -eq 0 ]; then
  echo "No reproducible local caches found."
fi
