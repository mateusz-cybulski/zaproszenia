#!/usr/bin/env bash
#
# Remove the local stack's containers and Docker build cache. Data volumes (databases, stored
# files) always stay.
#
# Usage (through mise):
#   mise run clean          containers (with their caches, e.g. Next's .next) and unused build cache
#   mise run clean --all    also the images built for the stack and all build cache:
#                           the next `mise run dev` builds everything from scratch

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

all=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --all) all=true ;;
    *) echo "Usage: mise run clean [--all]" >&2; exit 1 ;;
  esac
  shift
done

if $all; then
  # --rmi local: only images compose built itself; pulled ones (e.g. postgres) stay.
  docker compose down --remove-orphans --rmi local
  docker builder prune --all --force
else
  docker compose rm --stop --force
  docker builder prune --force
fi

rm -f src/*/tsconfig.tsbuildinfo

docker system df
