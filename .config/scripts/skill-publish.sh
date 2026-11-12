#!/usr/bin/env bash
#
# Commit and push the changes made in .agents/ (your agents branch) to origin.
#
# Usage (through mise):
#   mise run skill-publish             show what changed, ask, then commit and push
#   mise run skill-publish --yes       without asking
#   mise run skill-publish -m "Tune fastapi-expert"
#
# After publishing, install the skills in a project with `mise run agents`.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
source "$REPO_ROOT/.config/scripts/lib/agents-worktree.sh"

assume_yes=false
message=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes | -y) assume_yes=true ;;
    -m) message="${2:-}"; shift ;;
    *) echo "Usage: mise run skill-publish [--yes] [-m message]" >&2; exit 1 ;;
  esac
  shift
done

[[ -d "$AGENTS_DIR" ]] || { echo "Nothing to publish: .agents/ does not exist (run mise run skill-import first)." >&2; exit 1; }

agents() { git -C "$AGENTS_DIR" "$@"; }

agents add -A .claude
if agents diff --cached --quiet; then
  echo "Nothing to publish: .agents/ has no changes."
  exit 0
fi

echo "Changes on $AGENTS_BRANCH:"
agents diff --cached --stat | sed 's/^/  /'

# Default message: the skills/agents that changed, e.g. "Update skills: fastapi-expert".
if [[ -z "$message" ]]; then
  changed="$(agents diff --cached --name-only -- .claude/skills .claude/agents |
    cut -d/ -f3 | sort -u | tr '\n' ' ')"
  message="Update skills: ${changed:-stacks.conf}"
fi

if ! $assume_yes; then
  if [[ -t 0 ]] && command -v gum >/dev/null; then
    gum confirm "Commit \"$message\" and push to origin/$AGENTS_BRANCH?" ||
      { agents reset -q; echo "Cancelled, nothing committed."; exit 1; }
  elif [[ -t 0 ]]; then
    read -r -p "Commit \"$message\" and push to origin/$AGENTS_BRANCH? [y/N] " answer
    [[ "$answer" == [yY]* ]] || { agents reset -q; echo "Cancelled, nothing committed."; exit 1; }
  else
    agents reset -q
    echo "No terminal: run with --yes to publish without asking." >&2
    exit 1
  fi
fi

# The agents branch has no lefthook config of its own.
agents commit -q --no-verify -m "$message"
agents push -q origin "$AGENTS_BRANCH"
echo "Published $(agents log --oneline -1) to origin/$AGENTS_BRANCH"
