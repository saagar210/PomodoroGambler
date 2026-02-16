#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Heavy build/runtime artifacts. Intentionally avoids dependency directories.
HEAVY_PATHS=(
  "dist"
  "build"
  "out"
  ".next"
  "target"
  "coverage"
  ".parcel-cache"
  ".turbo"
  ".vite"
  ".tmp"
  "tmp"
  "temp"
  ".eslintcache"
)

removed_any=0

for path in "${HEAVY_PATHS[@]}"; do
  if [ -e "$path" ]; then
    rm -rf -- "$path"
    echo "Removed $path"
    removed_any=1
  fi
done

if [ "$removed_any" -eq 0 ]; then
  echo "No heavy build artifacts found."
fi
