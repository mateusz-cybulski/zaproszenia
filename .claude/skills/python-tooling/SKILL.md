---
name: python-tooling
description: "Use when creating, configuring or changing a Python component in this repo (src/<name> with pyproject.toml): Python 3.14, uv (dependencies, lockfile, uv run), ruff (lint and format), mypy strict with the Pydantic plugin, pytest, the component's mise.toml, lefthook hooks, Dockerfile and Dockerfile.dev for Cloud Run. Also use when adding or upgrading a Python dependency, fixing ruff/mypy/pytest failures, or writing Python code that must pass them."
license: MIT
metadata:
  version: "1.1.0"
  python: "3.14"
---

# Python tooling (3.14, uv, ruff, mypy, pytest)

A Python component is `src/<name>/` with a `pyproject.toml`. All commands below run in that directory. How the component becomes a Cloud Run service is in the `platform` skill; FastAPI specifics are in `fastapi-expert`.

## 1. Layout

```
src/<name>/
  pyproject.toml      project, dependencies, ruff/mypy/pytest config
  uv.lock             committed; the only source of installed versions
  .python-version     3.14 (written by `uv python pin 3.14`)
  mise.toml           [tools] python + uv, so `mise install --monorepo` sets them up
  app/                the package (import name `app`)
  tests/
  Dockerfile          production image (Cloud Run, linux/amd64)
  Dockerfile.dev      local dev image (compose, linux/amd64, reload)
  compose.yml
  lefthook.yml
  .dockerignore
```

```toml
# src/<name>/mise.toml
[tools]
python = "3.14"
uv = "0.13.7"
```

## 2. Dependencies with uv

- `uv add <package>` / `uv add --dev <package>` / `uv remove <package>`. Never edit versions in `uv.lock` by hand, never `pip install`.
- Dev tools go in the `dev` group, which `uv sync` and `uv run` include by default:

```toml
[project]
name = "api"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = [
  "fastapi>=0.120",
  "uvicorn>=0.38",
  "pydantic-settings>=2.11",
]

[dependency-groups]
dev = ["ruff>=0.14", "mypy>=1.18", "pytest>=9", "pytest-asyncio>=1.2", "httpx>=0.28"]
```

  The version floors above are examples; `uv add` writes the current ones.
- Run everything through uv so the locked environment is used: `uv run pytest`, `uv run mypy .`, `uv run python -m app.cli`.
- After pulling changes: `uv sync`. In CI and Docker: `uv sync --locked` (fails if `uv.lock` is out of date instead of silently re-resolving).
- Upgrades: `uv lock --upgrade-package <package>` for one package, `uv lock --upgrade` for all; review the `uv.lock` diff.

## 3. Python 3.14 in practice

- Annotations are evaluated lazily (PEP 649/749): forward references no longer need quotes or `from __future__ import annotations`. Do not add the `__future__` import in new code.
- `except TimeoutError, ConnectionError:` without parentheses is valid only in 3.14 and only without `as`. Keep the parenthesized form; it reads the same and survives copy-paste into older code.
- `return`/`break`/`continue` inside `finally` now emits `SyntaxWarning`: do not write it.
- `asyncio.get_event_loop()` raises when there is no running loop: use `asyncio.run()` or `asyncio.Runner`. The asyncio policy API is deprecated.
- On Linux, `ProcessPoolExecutor` defaults to `forkserver`: pass `mp_context` if code relied on `fork`.
- `compression.zstd` is in the standard library.
- Free-threaded builds (`python3.14t`) are supported but not what `python:3.14-slim` ships; do not target them unless every native dependency supports them.
- Before adding a dependency, check it publishes a CPython 3.14 (or `abi3`) wheel for `manylinux_*_x86_64`: every container here is `linux/amd64`, locally and on Cloud Run (see `platform`). A missing wheel means a source build in Docker. A macOS wheel only matters for running `uv run` natively on the Mac.

## 4. Ruff (lint + format)

Ruff replaces flake8, isort, pyupgrade and black. Use `ruff format`, not black.

```toml
[tool.ruff]
line-length = 100
# target-version comes from project.requires-python

[tool.ruff.lint]
extend-select = [
  "I",     # isort
  "UP",    # pyupgrade
  "B",     # bugbear
  "SIM",   # simplify
  "C4",    # comprehensions
  "PTH",   # pathlib
  "RUF",
  "ASYNC", # blocking calls in async code
  "S",     # bandit security checks
  "N",     # pep8 naming
]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101"]  # assert is how pytest works
```

- `uv run ruff check --fix .` then `uv run ruff format .`.
- Do not silence a rule with `# noqa` without the code (`# noqa: S608`) and a reason in the same line.

## 5. mypy (strict)

```toml
[tool.mypy]
strict = true
plugins = ["pydantic.mypy"]
warn_unreachable = true

[tool.pydantic-mypy]
init_forbid_extra = true
init_typed = true
warn_required_dynamic_aliases = true
```

- Every function is fully annotated; no implicit `Any`. Use `X | None`, `list[int]`, `collections.abc` types.
- A library without types: install its `types-*` stub package into `dev`; if none exists, add a scoped override, not a global `ignore_missing_imports`:

```toml
[[tool.mypy.overrides]]
module = ["morfeusz2.*"]
ignore_missing_imports = true
```

- `# type: ignore[code]` only with the error code.

## 6. pytest

```toml
[tool.pytest]
testpaths = ["tests"]
pythonpath = ["."]
addopts = ["-ra", "--strict-markers", "--strict-config"]
asyncio_mode = "auto"
```

(`[tool.pytest]` with native TOML types needs pytest 9; on older pytest use `[tool.pytest.ini_options]` with string values.)

`pythonpath = ["."]` is required: the component is an application without `[build-system]`, so uv does not install `app` into the venv, and without it tests fail with `No module named 'app'`.

- Tests live in `tests/`, mirror the package layout, and run with `uv run pytest`.
- Async code: `pytest-asyncio` in auto mode; HTTP endpoints through `httpx.AsyncClient(transport=ASGITransport(app=app))`.
- No network or real cloud services in unit tests: inject clients through dependencies and replace them in tests. Tests that need PostgreSQL run against a disposable database (compose service or testcontainers), never a shared one.

## 7. lefthook

`src/<name>/lefthook.yml` (merged into the root config through `extends: src/*/lefthook.yml`; `__NAME__` is replaced by `mise run add-setup`):

```yaml
pre-commit:
  jobs:
    - name: __NAME__-ruff
      root: src/__NAME__/
      glob: "*.py"
      run: uv run --frozen ruff check {staged_files} && uv run --frozen ruff format --check {staged_files}

    # Whole-project checks: a change in one file can break another.
    - name: __NAME__-mypy
      root: src/__NAME__/
      run: |
        git diff --cached --name-only --relative -- . | grep -qE '\.py$|^pyproject\.toml$' || exit 0
        uv run --frozen mypy .

pre-push:
  jobs:
    - name: __NAME__-pytest
      root: src/__NAME__/
      glob: "*.py"
      run: uv run --frozen pytest -q
```

## 8. Docker

Production `Dockerfile` (built by Terraform for `linux/amd64` with `src/<name>` as context; see `platform`). It must listen on `$PORT` on `0.0.0.0`. The image is built by Terraform's docker provider, so do not rely on BuildKit-only features (`RUN --mount`, `COPY --link`) unless you have verified the provider builds with BuildKit.

```dockerfile
FROM python:3.14-slim AS build
COPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /uvx /bin/
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0 \
    UV_NO_DEV=1
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project
COPY . .
RUN uv sync --locked

FROM python:3.14-slim
RUN useradd --system --uid 10001 app
WORKDIR /app
COPY --from=build --chown=app:app /app /app
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PORT=8080
USER app
EXPOSE 8080
CMD exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}" --proxy-headers --forwarded-allow-ips="*"
```

- Shell-form `CMD` with `exec` so `$PORT` (set by Cloud Run) expands and uvicorn still receives signals.
- One uvicorn process per container: Cloud Run scales instances, not workers.
- `--proxy-headers --forwarded-allow-ips="*"`: Cloud Run terminates TLS; without them `request.url` and redirects use `http://`.
- `.dockerignore`: `.venv`, `__pycache__`, `.pytest_cache`, `.mypy_cache`, `.ruff_cache`, `.git`, `Dockerfile*`, `.env*`, `tests/`. Use `.dockerignore`, not `Dockerfile.dockerignore` (Terraform ignores the latter).

`Dockerfile.dev` for compose (source synced by Compose Watch, reload; see `platform`):

```dockerfile
FROM python:3.14-slim
COPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /uvx /bin/
ENV UV_LINK_MODE=copy UV_PROJECT_ENVIRONMENT=/venv PATH="/venv/bin:$PATH" PYTHONUNBUFFERED=1
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project
COPY . .
RUN uv sync --locked
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

`UV_PROJECT_ENVIRONMENT=/venv` keeps the virtualenv outside `/app`, so syncing the source into `/app` never touches it. In `compose.yml`, `develop.watch` syncs `.` to `/app` and rebuilds on `pyproject.toml` and `uv.lock`; do not mount the source or keep `/venv` in an anonymous volume (it would survive rebuilds with old packages).

## 9. Before finishing

Run in `src/<name>`: `uv run ruff check . && uv run ruff format --check . && uv run mypy . && uv run pytest -q`. If `pyproject.toml` changed, also `uv lock --check`.
