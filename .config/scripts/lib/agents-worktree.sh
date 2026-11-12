# Shared by skill-import.sh and skill-publish.sh. Source it, do not run it.
#
# The agents branch is checked out as a git worktree in .agents/ (gitignored), so its
# skills can be edited in place and published with `mise run skill-publish`.
#
# open_agents_worktree
#   Creates .agents/ on first use, otherwise fast-forwards it to origin. Sets AGENTS_DIR.

AGENTS_BRANCH="${AGENTS_REF:-agents}"
AGENTS_DIR="$REPO_ROOT/.agents"

open_agents_worktree() {
  if [[ -d "$AGENTS_DIR" ]]; then
    git -C "$AGENTS_DIR" pull -q --ff-only ||
      { echo "Error: .agents/ has diverged from origin/$AGENTS_BRANCH; resolve it there first." >&2; exit 1; }
    return
  fi

  git -C "$REPO_ROOT" fetch -q origin "$AGENTS_BRANCH" ||
    { echo "Error: cannot fetch branch '$AGENTS_BRANCH' from origin." >&2; exit 1; }
  if git -C "$REPO_ROOT" show-ref -q --verify "refs/heads/$AGENTS_BRANCH"; then
    git -C "$REPO_ROOT" worktree add -q "$AGENTS_DIR" "$AGENTS_BRANCH" ||
      { echo "Error: branch '$AGENTS_BRANCH' is checked out elsewhere (git worktree list)." >&2; exit 1; }
    git -C "$AGENTS_DIR" merge -q --ff-only "origin/$AGENTS_BRANCH"
  else
    git -C "$REPO_ROOT" worktree add -q --track -b "$AGENTS_BRANCH" "$AGENTS_DIR" "origin/$AGENTS_BRANCH"
  fi
}
