---
name: git-workflow-and-versioning
description: "Use when committing, branching, splitting uncommitted work into separate commits, writing a commit message or a pull request description (with a \"Check on production\" checklist), pushing, merging, resolving conflicts, rewriting history, or cutting a release in this repo. Covers this repo's rules: commits and pushes only when the user asks, English git texts in plain sentences (no feat:/fix: prefixes), feat/ fix/ refactor/ branches (one topic per branch; an unrelated request mid-branch gets a new branch from main) merged with a merge commit one pull request at a time (the target branch's runs pass before the next merge), one logical change per commit, checks before committing, and force pushes only with the user's consent. For splitting a branch into several dependent pull requests see stacked-prs."
license: MIT
metadata:
  version: "1.4.0"
  source: "Adapted from addyosmani/agent-skills git-workflow-and-versioning (MIT)"
---

# Git workflow and versioning

Commits are save points, branches are sandboxes, history is documentation. Here the user decides when a save point is made and when anything leaves the machine; the agent makes each of those steps clean.

## 0. This repo's rules (they override everything below)

| Rule | Why |
|---|---|
| **Commit only when the user asks** ("zacommituj", "commit"). Finishing a step is not a request. | The user reviews each step in the browser before it becomes history. |
| **Push only when the user asks** ("wypchnij", "push"), and push nothing else in the same command. | Pushing publishes; CI and deploys start from it. |
| **Never rewrite published history without explicit consent**: no `push --force` / `--force-with-lease`, no rebase or amend of pushed commits, no `reset` of a pushed branch. Ask first, name the branch and what changes. | Others (and GitHub's PRs) may already point at those commits. |
| Git texts (commit messages, PR titles and descriptions, branch names) are **in English**, whatever language the conversation is in. | The repo is public-facing. |
| Names or details a project keeps out of git texts (its `CLAUDE.md`, memory) stay out. | Project rules. |
| End commit messages with the attribution line the session gives (`Co-Authored-By: …`). | Attribution. |

## 1. One logical change per commit

Each commit does one thing and leaves the project working (lint, types, tests pass):

```
# Good: each commit stands on its own
b2ef6de6 Checkout: address step, delivery options and order summary
a98fec21 Skills: the UI kit comes from shadcn/ui
53c4de10 UI kit: shadcn textarea, toggle group, checkbox and pagination

# Bad: everything mixed together
x1y2z3a Checkout, kit swap, skill updates and a dialog fix
```

- **Keep concerns separate.** A refactor and a feature are two commits; formatting-only changes never ride along with behaviour changes. Skill and docs changes (`.claude/skills`) go in their own commit (`Skills: …`).
- **Size.** About 100–300 changed lines is easy to review. Around 1000 lines, split it (by layer, by step, or into stacked branches: see `stacked-prs`). Generated files and lockfiles do not count.

## 2. Messages

Format: a short subject in plain English (imperative or descriptive, no `feat:`/`fix:` prefix, no trailing period), a blank line, then a body that explains **why** and what a reviewer needs to know.

```
Order list shows each order's total with tax

The list showed the net amount, so customers compared it with the invoice
and reported a wrong price. The list now shows the gross total, and the net
amount moves to the order's details.

API
- GET /orders returns total_gross next to total_net ...

Co-Authored-By: …
```

- A subject may start with the area and a colon when that reads better: `Checkout: delivery options`, `Skills: dialog layout`, `UI kit: shadcn tooltip`.
- The body is grouped (API / Frontend / Tests) when the commit spans layers; bullets say what changed and why, not which lines.
- Write the message to a file in the scratchpad and commit with `git commit -F <file>`; `-F -` with a heredoc is unreliable here.
- Never: `update`, `fix`, `misc`, `wip`.

### Pull request descriptions

Written to a file in the scratchpad (`gh pr create --body-file`) and shown to the user in the reply.

```markdown
## What
What the change does for the user, and why.

## <Area> (Frontend, API, Skills, ...)
- what changed, grouped like the commit bodies

## Testing
What was checked before the pull request: checks, tests, browser steps.

## Check on production
- [ ] Sign in with Google on the production domain: the account page opens (new OAuth redirect URI).
- [ ] Upload an invoice PDF: it appears in the list (new bucket permission).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Check on production** lists only what the local environment cannot reproduce. Everything the change does that runs locally (its flows, both services together, an old and a new service side by side) is checked before the pull request and goes under Testing, not here. What belongs here:

- configuration that exists only in production: environment variables, secrets, IAM roles and bucket permissions, Terraform resources;
- domains, certificates, OAuth redirect URIs, CORS origins;
- third-party services on real accounts (sign-in providers, storage, AI APIs, email);
- a migration or a backfill over real data, with its old and unusual rows;
- load the local stack does not have: real data volumes, instance memory and request time limits.

One checkbox per item, as a step with the expected result; never "check that it works". When none applies, write `Nothing to check: no change depends on the production environment.` instead of leaving the section out. That the deploy itself succeeded is shown by the runs on the target branch.

## 3. Branches

```
main (deployed on every push)
  ├── feat/<what>       new feature        feat/checkout
  ├── fix/<what>        bug fix            fix/cleanups
  └── refactor/<what>   no behaviour change refactor/pagination
```

- Branch from `main`, kebab-case names. **Check the current branch before committing**: never commit onto `main`; if the work started on `main`, create the branch first.
- A new branch's upstream is its own remote branch (`git push -u origin feat/x` when the user asks to push), never `origin/main`. A branch tracking `origin/main` pushes straight to main.
- Pull requests are merged on GitHub **with a merge commit**, so history shows the work happened on a branch. Never fast-forward or squash a feature branch into `main` locally. A local merge, when the user asks for one, is `git merge --no-ff -F <message file>`.
- **One topic per branch.** A branch may live for several steps of its own topic (data, kit, UI, save), but merge `main` in when it moves, and keep each step a commit. The branch name and the pull request title must still describe everything in it.

### A new request while a branch is open

The user often asks for the next thing in the middle of a branch. Before writing any code, decide whether it belongs to the branch's topic:

- **It does** (a fix or a change to what this branch builds, e.g. a tweak to the skeleton on a loading branch): keep working on the branch.
- **It does not** (a new feature, another screen, another component, e.g. a date picker on a loading branch): finish or commit the current step first (when the user agrees to commit), then `git switch -c <prefix>/<topic> main` and do the new work there. Say in one line that it goes to a new branch and why.
- **Unclear**: ask before starting, with both options.

A new branch from `main` does not see the open branch's unmerged work. If the new topic needs it, say so and either branch from the open branch (a stack, see `stacked-prs`) or wait until it is merged.

**Before opening a pull request**, read `git log --oneline main..HEAD`. If the commits cover more than one topic, tell the user and propose splitting them (separate branches with the commits picked over, or `stacked-prs`) before anything reaches `main`; once merged, splitting would need rewriting `main`.

### Merging pull requests (when the user asks)

**One pull request at a time, each only after the target branch is green again.** A workflow that cancels runs superseded by a newer commit (`cancel-in-progress`) leaves the earlier merge commits never checked when several PRs are merged in a row, and a push to `main` may also deploy.

1. Wait for the PR's own checks: `gh pr checks <n> --watch`. Anything not `pass` stops the merge: report it.
2. Merge: `gh pr merge <n> --merge` (never `--squash` or `--rebase`).
3. Wait for **every** workflow run that merge started on the target branch, checks and deploy: `gh run list --branch <target> --commit <merge sha>`, then `gh run watch <id> --exit-status` for each. A failure stops the sequence: report it and do not merge the next PR.
4. Only then merge the next PR, and check that it is still mergeable (the previous merge can conflict with it).

## 4. Splitting uncommitted work into commits

When several changes have piled up:

1. `git status --short` and `git diff --stat`; read the diff and group it into logical changes (e.g. kit component, feature UI, skill update).
2. Stage one group at a time **by file**: `git add <paths>`. Interactive staging (`git add -p`, `git add -i`, `git rebase -i`) waits for keyboard input and does not work for an agent.
3. When one file holds two changes, split it with a patch: `git diff <file> > <scratchpad>/all.patch`, edit a copy down to the hunks of the first change, `git apply --cached <copy>`; check with `git diff --cached`.
4. Commit the group (when the user asked for commits), then repeat. Each commit must pass the checks on its own, so order them: shared code before the code that uses it.

## 5. Before every commit

```bash
git status --short && git diff --cached --stat    # only what belongs to this commit
git diff --cached -i -G'password|secret|api_key|token' --name-only   # any output: read it
```

Then run the checks of every component touched, over the whole component: the lefthook hooks (`src/<name>/lefthook.yml`) run them on commit too, but only on staged files. For example:

| Component | Run |
|---|---|
| Next.js (`src/frontend`) | `npx --no-install eslint --max-warnings=0 . && npx --no-install tsc --noEmit && npx --no-install steiger ./src && npx --no-install prettier --check .` |
| FastAPI (`src/api`) | `uv run --frozen ruff check . && uv run --frozen ruff format --check . && uv run --frozen mypy . && uv run --frozen pytest -q` |

When the repo has a checks workflow in GitHub Actions, it runs the same on every push.

Never commit `.env*`, `node_modules/`, `.next/`, local preview or output folders, scratchpad files or credentials.

## 6. After a change: the summary

Tell the user, in their language:
- what changed (by behaviour, not by file list),
- what was verified and how (checks, browser),
- what was deliberately not touched or is still open,
- what is committed and what is not, and whether anything was pushed.

## 7. Worktrees for parallel work

A second line of work without switching the user's checkout:

```bash
git worktree add ../<repo>-review feat/other-branch   # separate folder, own branch
git worktree remove ../<repo>-review                   # when done
```

Never switch, stash or reset the user's working tree to look at another branch: read with `git show <rev>:<path>` or use a worktree.

## 8. Debugging with git

```bash
git log --oneline -20                 # recent history
git log --grep="preview" --oneline    # find by message
git diff main...HEAD --stat           # what this branch changes
git bisect start; git bisect bad HEAD; git bisect good <sha>   # find the commit that broke it
git reflog                            # recover a lost commit or branch
```

## 9. Releases and versions

The app deploys from `main` and has no versioned consumers, so it has no release tags. Versions apply to:
- **skills** (`metadata.version` in `SKILL.md`): bump minor for a new rule, patch for a wording fix, major when a rule is reversed;
- anything published later (a package, a public API): `MAJOR.MINOR.PATCH`, where a behaviour change consumers relied on is a major, tagged with `git tag -a vX.Y.Z` only when the user asks.

## 10. Red flags

- Committing or pushing without being asked; pushing in a compound command.
- A commit on `main`, or a branch whose upstream is `origin/main`.
- A force push, rebase or amend of pushed commits without the user's explicit consent.
- `feat:`-style prefixes, non-English text or names the project keeps out of git texts.
- A commit that mixes a refactor with a feature, or code with skill updates.
- A commit that does not pass the checks on its own.
- Merging the next pull request before the previous merge's runs on the target branch (checks, deploy) have passed.
- A pull request description without the "Check on production" section, or one that repeats what was checked locally.
- Building an unrelated request on the open branch, or a pull request whose commits cover several topics.
