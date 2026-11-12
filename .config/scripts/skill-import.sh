#!/usr/bin/env bash
#
# Copy a skill from an installed Claude Code plugin into your own skills (the agents branch).
#
# Usage (through mise):
#   mise run skill-import fastapi-expert                      by name only
#   mise run skill-import fastapi-expert fastapi              also install it for the fastapi stack
#   mise run skill-import fastapi-expert@fullstack-dev-skills when several marketplaces have it
#   mise run skill-import --force fastapi-expert              replace your copy with the plugin's
#
# What it does:
#   1. Finds skills/<skill> in the installed plugins (.claude/plugins, then ~/.claude/plugins),
#      newest version first.
#   2. Opens your agents branch in .agents/ (a git worktree, gitignored).
#   3. Copies the skill to .agents/.claude/skills/<skill>, with the plugin's LICENSE and a
#      SOURCE file saying where it came from.
#   4. Adds "skills/<skill>  <technology>..." to .agents/.claude/stacks.conf if technologies
#      are given.
#
# Nothing is committed: edit the copy in .agents/, then run `mise run skill-publish`.
# Install the plugin first: claude plugin install <plugin>@<marketplace> --scope project

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
source "$REPO_ROOT/.config/scripts/lib/agents-worktree.sh"

usage() {
  echo "Usage: mise run skill-import [--force] <skill>[@<marketplace>] [technology...]" >&2
  exit 1
}

force=false
spec=""
techs=""
for arg in "$@"; do
  case "$arg" in
    --force) force=true ;;
    -*) usage ;;
    *) if [[ -z "$spec" ]]; then spec="$arg"; else techs+=" $arg"; fi ;;
  esac
done
[[ -n "$spec" ]] || usage

skill="${spec%%@*}"
marketplace=""
[[ "$spec" == *@* ]] && marketplace="${spec#*@}"
[[ "$skill" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "Error: '$skill' is not a valid skill name" >&2; exit 1; }

# --- Find the skill in the installed plugins ---------------------------------
# Plugin cache layout: <plugins root>/cache/<marketplace>/<plugin>/<version>/skills/<skill>

roots=("${CLAUDE_CODE_PLUGIN_CACHE_DIR:-$REPO_ROOT/.claude/plugins}")
[[ "${roots[0]}" != "$HOME/.claude/plugins" ]] && roots+=("$HOME/.claude/plugins")

market_glob="${marketplace:-*}"
candidates=""
for root in "${roots[@]}"; do
  [[ -d "$root/cache" ]] || continue
  # Newest version first (by modification time). $market_glob is a glob on purpose.
  # shellcheck disable=SC2086
  candidates+="$(ls -td "$root"/cache/$market_glob/*/*/skills/"$skill" 2>/dev/null || true)"$'\n'
done
source_dir="$(grep -m1 . <<<"$candidates" || true)"

if [[ -z "$source_dir" ]]; then
  echo "Error: skill '$skill' not found in installed plugins${marketplace:+ of marketplace '$marketplace'}." >&2
  echo "Install its plugin first: claude plugin install <plugin>@<marketplace> --scope project" >&2
  exit 1
fi

found_in="$(grep . <<<"$candidates" | sed 's|.*/cache/\([^/]*\)/.*|\1|' | sort -u)"
if [[ -z "$marketplace" && "$(wc -l <<<"$found_in")" -gt 1 ]]; then
  echo "Error: '$skill' is in several marketplaces, pick one:" >&2
  sed "s|^|  mise run skill-import $skill@|" <<<"$found_in" >&2
  exit 1
fi

plugin_dir="$(cd "$source_dir/../.." && pwd)"
version="$(basename "$plugin_dir")"
plugin="$(basename "$(dirname "$plugin_dir")")"
from_marketplace="$(basename "$(dirname "$(dirname "$plugin_dir")")")"

# --- Copy into the agents branch ---------------------------------------------

open_agents_worktree
target="$AGENTS_DIR/.claude/skills/$skill"

if [[ -e "$target" ]] && ! $force; then
  echo "Error: .agents/.claude/skills/$skill already exists (your copy). Use --force to replace it." >&2
  exit 1
fi

rm -rf "$target"
mkdir -p "$(dirname "$target")"
cp -R "$source_dir" "$target"
for license in LICENSE LICENSE.md LICENSE.txt; do
  if [[ -f "$plugin_dir/$license" && ! -e "$target/$license" ]]; then
    cp "$plugin_dir/$license" "$target/$license"
  fi
done
cat >"$target/SOURCE" <<EOF
Imported with \`mise run skill-import\` from the Claude Code plugin
$plugin@$from_marketplace, version $version (skills/$skill).
Local edits are expected; re-import with --force to start over from the plugin.
EOF
echo "Copied $plugin@$from_marketplace $version: skills/$skill -> .agents/.claude/skills/$skill"

# --- Register in stacks.conf ---------------------------------------------------

config="$AGENTS_DIR/.claude/stacks.conf"
if [[ -n "$techs" ]]; then
  line="$(printf '%-38s %s' "skills/$skill" "${techs# }")"
  if grep -qE "^skills/$skill[[:space:]]" "$config"; then
    sed -i.bak -E "s|^skills/$skill[[:space:]].*|$line|" "$config" && rm "$config.bak"
  else
    printf '%s\n' "$line" >>"$config"
  fi
  echo "stacks.conf: $line"
fi

echo
echo "Edit it in .agents/.claude/skills/$skill, then publish with: mise run skill-publish"
