---
name: zaproszenia-git
description: "Use with git-workflow-and-versioning whenever you commit, branch, write a commit message or a pull request, push or merge in this project: the conversation is in Polish while git texts stay English, the old product the app is rebuilt from is never named, PR descriptions go in the reply, the folders never committed here (.previews/), the checks for src/frontend and src/api, and where shared skills are edited (~/work/base-web-agents). Project-specific; the general rules are in git-workflow-and-versioning and stacked-prs."
license: MIT
metadata:
  version: "1.1.0"
---

# Git in this project

Additions to `git-workflow-and-versioning` and `stacked-prs` (shared, synced by `mise run agents`). Where they differ, this file wins.

## 1. Language and names

- The conversation, summaries and questions are in **Polish**; commit messages, PR titles and descriptions and branch names are in **English**.
- **Never name the old product** the app is rebuilt from in git texts (commits, PRs, branches), nor in shared skills.
- UI copy quoted in git texts stays as the app shows it ("Zapisz", "Wróć do edycji").

## 2. Pull requests

- Show the PR description in the reply as well (the user reads it there), never only in a file.
- The checklist "Check on production" uses the real Polish labels the user will click.
- Merging: one PR at a time, after its checks and after every run of the previous merge on `main` (Checks, Infrastructure), as `git-workflow-and-versioning` says. `gh` is at `/opt/homebrew/bin/gh`.

## 3. Before committing

- Hooks: `lefthook install` once per clone (config in `.config/lefthook.yml`); they run on staged files only, so also run the whole component:

| Component | Checks |
|---|---|
| `src/frontend` | `npx --no-install eslint --max-warnings=0 . && npx --no-install tsc --noEmit && npx --no-install steiger ./src && npx --no-install prettier --check .` |
| `src/api` | `uv run --frozen ruff check . && uv run --frozen ruff format --check . && uv run --frozen mypy . && uv run --frozen pytest -q` |

- Never commit `.previews/` (rendered previews and sample PDFs) or anything from the scratchpad.
- UI changes (anything the user sees, loading included) are committed only after the user has clicked through them.

## 4. Shared skills

- Shared skills are edited in the clone of the `agents` branch at `~/work/base-web-agents` (never under `/tmp`), committed there and pushed by Claude right after (`git push origin agents`); then `mise run agents --yes` brings them here, and `git status` must show no change in the synced skills.
- Before a commit there, check the changed skills for this project, as `platform` says: `git grep -n -i -E 'zaproszeni|guest|wydarzen|szablon|<old product>' -- .claude/skills` and the diacritics grep; nothing may remain outside `polish-nlp`.
- Project rules go to `zaproszenia-ui`, `zaproszenia-api` or this file, never into a copy of a shared skill.
- Worktrees for a second line of work: `git worktree add ../zaproszenia-review <branch>`.
