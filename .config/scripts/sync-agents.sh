#!/usr/bin/env bash
#
# Install the Claude Code skills and agents for a technology stack into .claude.
#
# Usage (through mise):
#   mise run agents                    detect the stack from src/ and .config/, then pick
#   mise run agents nextjs tailwind    preselect this stack (plus "always"), then pick
#   mise run agents fastapi-expert     an argument can also name one skill/agent on the branch
#   mise run agents --yes [stack...]   no picker: install exactly what the stack gives
#   mise run agents --list             show the available technologies and entries, then exit
#
# What it does:
#   1. Fetches the agents branch of the template repository (a copy of a .claude folder).
#   2. Reads .claude/stacks.conf from it: which technologies exist and what each one installs.
#   3. Shows every skill/agent in a checklist (gum), with the stack's ones and the ones
#      already installed preselected. Without a terminal or gum, or with --yes, it skips
#      the checklist and uses the stack's entries.
#   4. Copies the chosen entries (e.g. .claude/skills/nextjs-best-practices) into this project.
#   5. Removes entries it installed earlier that were not chosen.
#
# Entries it did not install (listed in .claude/.managed) are never touched, so
# project-specific skills and agents can live next to the synced ones.
#
# Variables (set in mise.toml):
#   TEMPLATE_REPO   Template repository URL or path.
#   AGENTS_REF      Branch with the .claude folder (default: agents).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CLAUDE_DIR="$REPO_ROOT/.claude"
MANAGED_LIST="$CLAUDE_DIR/.managed"
CONFIG_PATH=".claude/stacks.conf"

repo="${TEMPLATE_REPO:-}"
ref="${AGENTS_REF:-agents}"
[[ -n "$repo" ]] || { echo "Error: TEMPLATE_REPO is not set (see [env] in mise.toml)" >&2; exit 1; }

list_only=false
assume_yes=false
requested=""
for arg in "$@"; do
  case "$arg" in
    --list) list_only=true ;;
    --yes | -y) assume_yes=true ;;
    -*) echo "Usage: mise run agents [--list] [--yes] [technology|skill...]" >&2; exit 1 ;;
    *) requested+=" $arg" ;;
  esac
done

# Space-separated sets, padded with spaces so " $x " matches whole words.
has() { [[ " $1 " == *" $2 "* ]]; }

# --- Fetch the agents branch -------------------------------------------------

source "$REPO_ROOT/.config/scripts/lib/fetch-branch.sh"
echo "Fetching $ref from $repo"
fetch_branch "$repo" "$ref"
agents_repo() { git -C "$FETCHED_DIR" "$@"; }

config="$(agents_repo cat-file -p "FETCH_HEAD:$CONFIG_PATH" 2>/dev/null)" ||
  { echo "Error: no $CONFIG_PATH on branch $ref" >&2; exit 1; }

# Every entry that can be installed: .claude/<group>/<name>, e.g. skills/code-reviewer.
available=""
for group in $(agents_repo ls-tree -d --name-only FETCH_HEAD:.claude); do
  for name in $(agents_repo ls-tree --name-only "FETCH_HEAD:.claude/$group"); do
    available+=" $group/$name"
  done
done

# --- Parse stacks.conf -------------------------------------------------------

section=""
detect_rules=""
install_rules=""
while IFS= read -r line; do
  line="${line%%#*}"
  [[ -z "${line// /}" ]] && continue
  case "$line" in
    "[detect]") section=detect ;;
    "[install]") section=install ;;
    *)
      if [[ "$section" == detect ]]; then
        detect_rules+="$line"$'\n'
      elif [[ "$section" == install ]]; then
        install_rules+="$line"$'\n'
      fi
      ;;
  esac
done <<<"$config"

known="always"
while read -r pattern rule_techs; do
  for tech in $rule_techs; do has "$known" "$tech" || known+=" $tech"; done
done <<<"$install_rules"
while read -r tech _; do
  [[ -n "$tech" ]] && ! has "$known" "$tech" && known+=" $tech"
done <<<"$detect_rules"

if $list_only; then
  echo "Technologies: $known"
  echo "Entries:"
  for entry in $available; do echo "  $entry"; done
  exit 0
fi

# An argument is a technology, or the name of an entry (skills/<name>, agents/<name>.md).
requested_techs=""
requested_entries=""
for arg in $requested; do
  if has "$known" "$arg"; then
    requested_techs+=" $arg"
    continue
  fi
  found=""
  for entry in $available; do
    name="${entry#*/}"
    [[ "$arg" == "$entry" || "$arg" == "$name" || "$arg.md" == "$name" ]] && found="$entry"
  done
  [[ -n "$found" ]] ||
    { echo "Error: '$arg' is neither a technology nor an entry on $ref. See: mise run agents --list" >&2; exit 1; }
  requested_entries+=" $found"
done

# --- Choose the stack --------------------------------------------------------

matches() {
  local glob="${1%%:*}" regex="" file
  [[ "$1" == *:* ]] && regex="${1#*:}"
  while IFS= read -r file; do
    [[ -z "$regex" ]] && return 0
    grep -qE "$regex" "$REPO_ROOT/$file" && return 0
  done < <(cd "$REPO_ROOT" && compgen -G "$glob" || true)
  return 1
}

# Technologies given as arguments replace detection; entries given by name come on top.
techs="always"
if [[ -n "$requested_techs" ]]; then
  for tech in $requested_techs; do
    has "$techs" "$tech" || techs+=" $tech"
  done
else
  while read -r tech pattern; do
    [[ -n "$tech" ]] || continue
    has "$techs" "$tech" && continue
    matches "$pattern" && techs+=" $tech"
  done <<<"$detect_rules"
fi
echo "Stack: $techs"

# --- Resolve entries ---------------------------------------------------------

wanted=""
while read -r pattern rule_techs; do
  [[ -n "$pattern" ]] || continue
  active=false
  for tech in $rule_techs; do
    has "$techs" "$tech" && active=true
  done
  $active || continue
  found=false
  for entry in $available; do
    # shellcheck disable=SC2053  # $pattern is a glob on purpose
    if [[ "$entry" == $pattern ]]; then
      found=true
      has "$wanted" "$entry" || wanted+=" $entry"
    fi
  done
  $found || echo "Warning: '$pattern' in $CONFIG_PATH matches nothing on $ref" >&2
done <<<"$install_rules"

for entry in $requested_entries; do
  has "$wanted" "$entry" || wanted+=" $entry"
done

managed=""
[[ -f "$MANAGED_LIST" ]] && managed="$(tr '\n' ' ' <"$MANAGED_LIST")"

# --- Pick ----------------------------------------------------------------------

# Technologies an entry belongs to, from [install], e.g. "nextjs" for skills/nextjs-sitemap.
entry_techs() {
  local entry="$1" out="" pattern rule_techs tech
  while read -r pattern rule_techs; do
    [[ -n "$pattern" ]] || continue
    # shellcheck disable=SC2053  # $pattern is a glob on purpose
    [[ "$1" == $pattern ]] || continue
    for tech in $rule_techs; do has "$out" "$tech" || out+=" $tech"; done
  done <<<"$install_rules"
  echo "${out# }"
}

if $assume_yes; then
  :
elif [[ ! -t 0 || ! -t 1 ]]; then
  echo "No terminal: installing the stack's entries without asking."
elif ! command -v gum >/dev/null; then
  echo "gum not found (run: mise install): installing the stack's entries without asking."
else
  # One line per entry: "<entry>  <technologies>"; the entry is the first word.
  items=()
  preselected=""
  for entry in $available; do
    label="$(printf '%-36s %s' "$entry" "$(entry_techs "$entry")")"
    items+=("$label")
    if has "$wanted" "$entry" || has "$managed" "$entry"; then
      preselected+="${preselected:+,}$label"
    fi
  done
  # Fit the list to the terminal: gum cuts off whatever does not fit, with no hint that
  # more entries exist. Leave room for the header, the page dots and the help line.
  rows="$(stty size </dev/tty 2>/dev/null | cut -d' ' -f1)"
  height="${#items[@]}"
  if [[ "$rows" =~ ^[0-9]+$ ]] && ((rows - 5 < height)); then
    height=$((rows - 5 > 3 ? rows - 5 : 3))
  fi
  page_hint=""
  ((height < ${#items[@]})) && page_hint=", ←/→: more pages"
  chosen="$(gum choose --no-limit --height="$height" \
    --header="${#items[@]} entries. Space: toggle, Enter: install$page_hint (stack: $techs)" \
    --selected="$preselected" "${items[@]}")" || { echo "Cancelled, nothing changed."; exit 1; }
  wanted=""
  while IFS= read -r label; do
    [[ -n "$label" ]] && wanted+=" ${label%% *}"
  done <<<"$chosen"
fi

# --- Install -----------------------------------------------------------------

mkdir -p "$CLAUDE_DIR"

for entry in $managed; do
  if ! has "$wanted" "$entry"; then
    rm -rf "${CLAUDE_DIR:?}/$entry"
    echo "  - $entry"
  fi
done

installed=""
for entry in $wanted; do
  if [[ -e "$CLAUDE_DIR/$entry" ]] && ! has "$managed" "$entry"; then
    echo "Warning: .claude/$entry exists and was not installed by this script, skipping" >&2
    continue
  fi
  rm -rf "${CLAUDE_DIR:?}/$entry"
  agents_repo archive FETCH_HEAD ".claude/$entry" | tar -x -C "$CLAUDE_DIR" --strip-components=1
  has "$managed" "$entry" && echo "  = $entry" || echo "  + $entry"
  installed+="$entry"$'\n'
done

printf '%s' "$installed" >"$MANAGED_LIST"
echo "Synced to .claude"
