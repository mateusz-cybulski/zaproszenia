---
name: remove-comments
description: "Use when writing or changing code in this repo, to decide whether a comment belongs there (by default it does not), and when asked to remove, strip or clean up comments (\"remove comments\", \"strip comments\", \"clean up comments\") in a file, a directory, or the current changes. Keeps only comments without which the code cannot be understood (a non-obvious workaround or tweak, a constraint the code cannot show) and the comment-shaped lines that change behavior (shebangs, directives, lint/type pragmas). Covers JS/TS/JSX, CSS, shell, Python, YAML, TOML, Terraform, Dockerfile and ignore files; verifies the code still lints, type-checks and parses afterwards."
license: MIT
metadata:
  version: "2.0.1"
---

# Comments: only when the code cannot speak for itself

Code explains itself through names, types and structure. A comment is the exception: it stays only when a reader would otherwise misunderstand the code or "fix" it into a bug. Everything else is removed, and is not written in the first place.

## 0. The rule (when writing code, too)

A comment is **necessary** only when it says something the code cannot show:

| Keep (necessary) | Example |
|---|---|
| A non-obvious workaround or tweak, with the reason | `// Cloud Run puts the container's own host in request.url, so take it from x-forwarded-host.` |
| A constraint from outside the code: a library bug, an API quirk, a platform limit, a security requirement | `# check_revoked: signing out must end sessions immediately.` |
| Why the obvious approach is wrong here | `// Not useEffect: the theme has to be set before the first paint.` |
| A required order or timing that looks arbitrary | `# Backfill before dropping the default, existing rows need a value.` |

| Remove (not necessary) | Example |
|---|---|
| Says what the next line does, or repeats a name or type | `// Sections of the app, in sidebar order.`, `# Create the user` |
| A doc comment that restates the signature | `/** The signed-in user. */ type Viewer` |
| Section banners and labels | `// --- helpers ---`, `{/* Header */}` |
| History and authorship | `// changed from X`, `// added for ticket 123`, `// TODO (unless tracked and wanted)` |
| Commented-out code | `// const old = ...` |

When unsure, ask: "would a competent reader of this file get it wrong without the comment?" If not, it goes. If the comment exists because a name is unclear, rename instead.

When writing new code, apply this rule before adding any comment, including doc comments (`/** */`) and Python docstrings: a docstring is written only when it carries a "keep" reason from the table above.

When asked to remove comments, follow the sections below. The user can ask to remove **all** comments ("all comments", "every comment"); then drop the "necessary" exception and keep only section 3.

## 1. Scope

| Request | Files |
|---|---|
| Named files or directories | Those, recursively |
| Nothing named | Changed and untracked files: `git status --porcelain` |
| "The whole repo" | All tracked files: `git ls-files` |

Always skip generated or vendored files: `node_modules/`, `.next/`, `out/`, `build/`, `.terraform/`, `.terraform.lock.hcl`, lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `uv.lock`, `poetry.lock`), `next-env.d.ts`, minified files, binaries.

Do not touch Markdown or HTML unless the user asks for them explicitly: `<!-- -->` in docs is often content. Python docstrings follow the rule in section 0 (they are strings, so a removed docstring must not leave an empty function or class body: put `...` or `pass` there only when nothing else remains).

## 2. What counts as a comment

| Language / file | Comment syntax |
|---|---|
| JS, TS, JSX, TSX, MJS, CJS | `// ...`, `/* ... */`, `/** ... */`, JSX `{/* ... */}` |
| CSS, SCSS | `/* ... */` (and `// ...` in SCSS) |
| Shell, Python, YAML, TOML, Terraform/HCL, Dockerfile, `.gitignore`, `.dockerignore`, `.env*` | `# ...` (HCL also `//` and `/* */`) |
| SQL | `-- ...`, `/* ... */` |
| HTML / Markdown (only if asked) | `<!-- ... -->` |

Shell scripts embedded in YAML (`run: |` blocks in lefthook or GitHub workflows) are shell: their `#` comment lines are comments too.

Each of them is removed unless it is necessary (section 0) or behavior (section 3). A necessary comment that also contains unnecessary parts is shortened to the reason alone.

## 3. Keep (behavior, not commentary)

These look like comments but change how the code runs, builds or is checked. Keep them and list them in the report.

- Shebangs: `#!/usr/bin/env bash`
- React directives: `"use client"`, `"use server"`, `"use cache"` (strings, never comments)
- Lint and type pragmas: `// eslint-disable*`, `/* eslint-disable */`, `// @ts-expect-error`, `// @ts-ignore`, `// @ts-nocheck`, `// prettier-ignore`, `# noqa`, `# type: ignore`, `# pyright:`, `# shellcheck disable=...`, `# tflint-ignore`
- Triple-slash directives: `/// <reference ... />`
- Dockerfile parser directives on the first lines: `# syntax=...`, `# escape=...`
- Encoding and tool headers: `# -*- coding: ... -*-`, `# yaml-language-server: $schema=...`
- Bundler/compiler magic comments: `/* webpackChunkName: ... */`, `//go:build`, `//go:generate`, `# frozen_string_literal: true`
- License headers when the file or repo states they are required

If a pragma has an explanation after it (`// eslint-disable-next-line no-console -- debug output`), keep the pragma and drop only the explanation (`-- debug output`).

## 4. How to edit safely

- Edit with the Edit tool, file by file. Never run a blanket `sed`/regex over many files: comment markers also appear inside code.
- Never touch `#`, `//` or `/*` inside strings, template literals, URLs (`https://`), regex literals, heredocs, CSS `url()` or YAML/TOML string values. Example: `color: "#fff"`, `run: echo "# not a comment"`, `const re = /\/\//`.
- A whole-line comment: delete the line. If that leaves two blank lines in a row, or a blank line right after an opening brace or at the start of a block, delete that blank line too.
- A trailing comment (`x = 1  # note`): delete the comment and the whitespace before it.
- A comment that was the only content of a block (e.g. an empty `catch {}` with a comment, or a YAML key whose value was only comments) stays syntactically valid: leave the empty block, do not delete code.
- Commented-out code is a comment: remove it.

## 5. Verify

Run the checks for every area you touched, from the right directory, and fix anything you broke:

| Touched | Check |
|---|---|
| `src/<name>` with `package.json` | `npx --no-install eslint --max-warnings=0 .` and `npx --no-install tsc --noEmit` (run in `src/<name>`, needs `npm ci` first) |
| `.config/terraform` | `terraform fmt -check -recursive` and `terraform validate` (after `terraform init -backend=false`) |
| Shell scripts | `bash -n <file>` |
| YAML | `ruby -ryaml -e "ARGV.each(&->(path) { YAML.safe_load(File.read(path)) })" <files>` (PyYAML is usually not installed) |
| TOML | `python3 -c 'import sys,tomllib; [tomllib.load(open(f,"rb")) for f in sys.argv[1:]]' <files>` |
| Python | `python3 -m py_compile <files>` |

Then run `git diff --stat` and skim the diff: only comment lines and trailing comments should be gone.

## 6. Report

Keep it short:

- files changed and the number of comments removed,
- the comments kept as necessary (file:line, one line each on why the code needs it),
- the comment-shaped lines kept as behavior (file:line, which rule from section 3),
- the checks you ran and their result.

Do not commit.
