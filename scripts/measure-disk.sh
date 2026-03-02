#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Disk usage snapshot ($(date '+%Y-%m-%d %H:%M:%S'))"

TRACKED_PATHS=(
  "node_modules"
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
  ".cache"
  "tmp"
  "temp"
)

for path in "${TRACKED_PATHS[@]}"; do
  if [ -e "$path" ]; then
    du -sh "$path"
  fi
done
