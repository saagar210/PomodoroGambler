#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-8000}"

cd "$ROOT_DIR"
echo "Starting AuraFlow on http://localhost:${PORT}"
exec python3 -m http.server "$PORT"
