---
name: stacked-prs
description: "Use when the user wants to split a large branch or feature into several smaller pull requests (stacked or dependent PRs), review a branch in parts, or manage a chain of branches where each builds on the previous one: cutting the stack from existing commits without rewriting history, naming, PR descriptions with the stack overview, updating lower branches, and merging in order with merge commits on GitHub. Follows git-workflow-and-versioning for commits, messages and pushes."
license: MIT
metadata:
  version: "1.3.0"
  source: "Adapted from bobmatnyc/claude-mpm-skills stacked-prs (MIT)"
---

# Stacked pull requests

A stack is a chain of branches where each one builds on the previous one, each with its own pull request against the branch below it. Reviewers read one step at a time; the steps still merge in order.

All rules of `git-workflow-and-versioning` apply: commits and pushes only when the user asks, English git texts, **no force push or history rewrite without explicit consent**.

## 1. When

| Stack | One pull request to `main` (default) |
|---|---|
| The user asks for it, or a branch is too big to review at once (roughly 1000+ changed lines) | Anything smaller, or independent changes (those get separate branches from `main`, not a stack) |
| The work has clear steps, each depending on the previous one (data → UI kit → editor UI → saving) | A single logical change |

Propose a stack with its steps and wait for the user's go-ahead before creating branches.

## 2. Names and titles

Same prefix and topic, numbered in merge order:

```
feat/checkout-1-data
feat/checkout-2-kit
feat/checkout-3-ui
```

PR titles: `[1/3] Checkout: order data, delivery options and prices`, `[2/3] …`. Each PR's base is the branch below it; only `[1/n]` targets `main`.

## 3. Cutting a stack from an existing branch (no history rewrite)

When the branch's commits already follow the steps, each stack branch is just a name on an existing commit. Nothing is rewritten, so nothing needs a force push:

```bash
git log --oneline main..feat/checkout          # find the last commit of each step
git branch feat/checkout-1-data  <sha of the last data commit>
git branch feat/checkout-2-kit   <sha of the last kit commit>
# the original branch (or a renamed copy) is the top of the stack
```

- Before cutting, check that each cut point passes the checks on its own (`git worktree add <scratchpad>/cut <sha>`, run the component checks there, remove the worktree). A step that does not build alone is not a valid cut point.
- When the commits mix steps, the stack needs reordered or split commits. That rewrites history: show the user the plan (which commits move where) and do it only with their consent, on new branches, keeping the original branch untouched until they confirm the result.
- Pushing the stack (when the user asks): `git push -u origin <branch>` for each branch, lowest first; then open the PRs with the right bases.

## 4. Building a stack while working

```bash
git switch main && git pull
git switch -c feat/x-1-data          # step 1 from main
# ... commits ...
git switch -c feat/x-2-ui            # step 2 from step 1, NOT from main
```

Wrong: creating step 2 from `main`. Its PR then either lacks step 1's code or repeats it.

## 5. PR description

```markdown
## This PR
What this step changes, on its own.

## Stack
1. #41 [1/3] Data (feat/x-1-data) ← merge first
2. #42 [2/3] UI kit (feat/x-2-kit) ← this PR
3. #43 [3/3] Editor (feat/x-3-editor)

## Review
Only this step's changes: `git diff feat/x-1-data...feat/x-2-kit`
(GitHub shows the same because the PR's base is feat/x-1-data.)

## Testing
What was checked for this step.

## Check on production
- [ ] Only what this step needs from the production environment (see git-workflow-and-versioning), or "Nothing to check"
  (see git-workflow-and-versioning, Pull request descriptions).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## 6. When a lower branch changes (review fixes)

Default, no rewrite: commit the fix on the lower branch, then **merge it upward** into each branch above, in order:

```bash
git switch feat/x-2-kit    && git merge --no-ff feat/x-1-data -m "Merge feat/x-1-data into feat/x-2-kit"
git switch feat/x-3-editor && git merge --no-ff feat/x-2-kit  -m "Merge feat/x-2-kit into feat/x-3-editor"
```

Plain pushes are enough afterwards. Rebasing the upper branches onto the new lower one gives a straighter history but needs `git push --force-with-lease` for every upper branch: only when the user explicitly chooses it.

## 7. Merging the stack

This repo merges pull requests on GitHub **with a merge commit** (no squash), which keeps the stack simple:

1. Merge `[1/n]` into `main`.
2. Change `[2/n]`'s base to `main` (GitHub does it by itself when the merged branch is deleted). Its diff now shows only its own step, because step 1's commits are already in `main`: no rebase needed.
3. Wait for the runs on `main` that merge started (checks and deploy) to pass, then for `[2/n]`'s own checks on its new base; only then merge it. Repeat. The steps of merging one PR and watching the target branch are in `git-workflow-and-versioning` (Merging pull requests).

Never squash-merge a lower PR: the upper branches still hold the original commits, so their PRs would show step 1 again and conflict.

## 8. Checklist

- [ ] The user agreed to a stack and to its steps.
- [ ] Each branch starts from the one below; only the first from `main`.
- [ ] Each cut point passes the checks on its own.
- [ ] Names are numbered in merge order; PR titles carry `[k/n]`.
- [ ] Each PR description has the stack overview and the review diff.
- [ ] No force push or history rewrite happened without the user's consent.
- [ ] Each merge waited for the target branch's runs of the previous merge to pass.
