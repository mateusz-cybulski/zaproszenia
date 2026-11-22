---
name: platform
description: "Use whenever you add, rename, remove or configure a component under src/, write a Dockerfile, compose.yml, service.json or lefthook.yml for one, read another service's URL, set environment variables or GCP permissions for a service, or wonder how code gets deployed. Describes this repo's platform: each src/<name> with a Dockerfile is a Cloud Run service on its own subdomain, deployed by Terraform from GitHub Actions; local dev runs through docker compose and mise."
license: MIT
metadata:
  version: "1.7.0"
---

# Platform: how components become services

Facts below come from `.config/terraform/` (`services.tf`, `main.tf`, `variables.tf`), `.github/workflows/terraform.yml`, `.config/docker-compose.yml`, `.config/scripts/` and `mise.toml`. If something here disagrees with those files, the files win: read them and say so.

## 1. One folder = one service = one subdomain

- Every `src/<name>/Dockerfile` becomes a Cloud Run service named `<name>`. A folder without a `Dockerfile` (shared code, docs) is not deployed.
- `<name>` must match `^[a-z][a-z0-9-]{0,47}[a-z0-9]$` (Terraform rejects anything else).
- Domains, with `<repo>` = the GitHub repository name, lower-cased, non `[a-z0-9-]` replaced by `-`, and `<base>` = `DNS_BASE_DOMAIN`:
  - `src/frontend` -> `https://<repo>.<base>` (the only service on the bare project domain),
  - any other `src/<name>` -> `https://<name>.<repo>.<base>`.
  So the public website must live in `src/frontend`; a site in `src/web` ends up at `web.<repo>.<base>` with nothing on the main domain.
- Each service is also reachable at its `*.run.app` URL (ingress is `INGRESS_TRAFFIC_ALL`). Use the custom domain everywhere (links, OAuth redirects, CORS, sitemaps); do not depend on `run.app`.
- Renaming or removing `src/<name>` destroys that service, its domain mapping and DNS record, and creates new ones for the new name. A new domain mapping needs a managed certificate, which can take from minutes to an hour. Treat a rename as a migration, not a refactor.

## 2. Adding a component

- From a template: `mise run add-setup <group>/<template> [name]` (templates live on the `templates` branch; the name defaults to the group, e.g. `frontend/next` -> `src/frontend`). It copies the template, replaces `__NAME__` in `compose.yml` and `lefthook.yml`, adds the compose file to `.config/docker-compose.yml`, installs the component's mise tools and offers matching Claude skills.
- By hand, a component needs: `Dockerfile`, `.dockerignore`, `Dockerfile.dev`, `compose.yml`, `lefthook.yml`, `mise.toml`, optionally `service.json`; then add `  - ../src/<name>/compose.yml` under `include:` in `.config/docker-compose.yml`.
- After adding a component, run `mise run agents` to install the skills for its stack.

### Skills: shared on the agents branch, or local to one project

`mise run agents` installs skills from the `agents` branch (listed in `.claude/stacks.conf`) and records them in `.claude/.managed`; it overwrites them on every run. Everything else in `.claude/skills` is local to the project and never touched.

- **A shared skill (agents branch) is written for any project on this platform**: entirely in English; no project names, repository names, domain examples, UI copy, file paths or helper names that exist in one project only. Examples use a neutral domain (orders, customers, invoices) and describe a project's own helpers as a pattern ("one shared form hook"), not by their name.
- **A project-local skill** (named after the project, e.g. `<project>-ui`) holds what is true for that project only: its helpers and where they live, its UI copy and language, its decisions (scope, accessibility baseline), its git conventions. It may be in the project's language. It never goes to the agents branch.
- **Never fork a shared skill into the project.** A project rule that changes a shared one goes into the project-local skill ("in this project, also …"); a rule every project needs goes to the shared skill on the agents branch. A managed skill edited in the project is overwritten by the next sync.
- Before committing to the agents branch, search the changed skills for the project's name, its domain words and non-English letters, e.g. `git grep -n -i -E '<project>|<domain words>' -- .claude/skills` and `git grep -n -P '[\x{0100}-\x{017F}]' -- .claude/skills` (Latin letters with diacritics); nothing may remain except in a skill about that language itself.

## 3. One architecture everywhere: linux/amd64

**Every image in this repo is `linux/amd64`, locally and in production.** Cloud Run runs only x86-64, and the project rule is that local containers match it exactly, so a dependency that works in `mise run dev` also works on Cloud Run.

- `compose.yml` of every component sets `platform: linux/amd64`; the root `mise.toml` sets `DOCKER_DEFAULT_PLATFORM=linux/amd64`, so plain `docker build` / `docker run` default to it too. Never switch a component to `linux/arm64`, not even "just locally".
- On Apple Silicon these containers run under emulation. In Docker Desktop enable *Settings → General → Use Rosetta for x86_64/amd64 emulation on Apple Silicon*; without it builds and hot reload are much slower.
- Choose dependencies by their `linux/x86_64` builds (e.g. `manylinux_*_x86_64` wheels, `amd64` base images). Missing arm64 builds do not matter.
- Native tools on the Mac (mise, `uv run`, `npm` outside Docker) still run as arm64; that is fine for editors and quick scripts, but the container is the reference environment.

## 4. Production Dockerfile

- Built by Terraform (docker provider) on the GitHub runner: context `src/<name>`, file `Dockerfile`, platform `linux/amd64`, tagged with the commit SHA, pushed to Artifact Registry.
- Only `src/<name>/.dockerignore` is honoured (Terraform ignores `Dockerfile.dockerignore`). Exclude `.git`, dependency folders, build caches, `.env*`, `Dockerfile*`.
- Do not rely on BuildKit-only syntax (`RUN --mount`, `COPY --link`) unless you have verified the Terraform docker provider builds with BuildKit.
- The container must listen on `0.0.0.0:$PORT`. Cloud Run sets `PORT` to the service's `port` (default 8080); default the image to 8080 too.
- Run as a non-root user, one server process per container (Cloud Run scales instances), and log to stdout/stderr (no log files).
- Behind Cloud Run, TLS is terminated by Google: trust forwarded headers (e.g. uvicorn `--proxy-headers --forwarded-allow-ips="*"`), or generated URLs come out as `http://`.

## 5. service.json

Optional per-service overrides, merged over these defaults:

```json
{
  "port": 8080,
  "public": true,
  "cpu": "1",
  "memory": "512Mi",
  "max_instances": 2,
  "env": {},
  "roles": []
}
```

- `public: false` removes the `allUsers` invoker binding: the service then needs authenticated callers (e.g. Cloud Tasks or another service with an OIDC token). The domain mapping still exists.
- `env`: plain configuration only. Values here are committed and visible in the Cloud Run console. **Never put secrets in `service.json`.**
- `roles`: project-level IAM roles granted to the service's own service account (`run-<name>@...`), e.g. `"roles/storage.objectAdmin"`, `"roles/cloudtasks.enqueuer"`, `"roles/aiplatform.user"`. Grant the narrowest role that works.
- Instances scale to zero (`min_instance_count = 0`): expect cold starts and keep startup fast.
- Changing `service.json` or a `Dockerfile` triggers a Terraform plan on pull requests; any push to `main` deploys.

## 6. Environment every service gets

- `GOOGLE_CLOUD_PROJECT`: the project ID.
- `<NAME>_URL` for **every** service (folder name upper-cased, `-` -> `_`): `FRONTEND_URL`, `API_URL`, `MY_WORKER_URL`, each `https://<its domain>`. Use these to call other services; never hard-code domains, they differ per project.
- Plus the service's own `service.json` `env`.
- These exist only at runtime on Cloud Run, not during `docker build`. Code that reads them must run at request or startup time, not at build time.
- Google APIs authenticate with Application Default Credentials: on Cloud Run that is the service account `run-<name>`; locally it is your `gcloud auth application-default login` credentials mounted into the container (see section 7). Never ship key files.
- Enabled APIs: Cloud Run, Compute, Cloud Build, Artifact Registry, Secret Manager, Vertex AI (`GCP_SERVICES_TO_ENABLE` in `variables.tf`). Anything else (Cloud SQL, Cloud Tasks, Storage buckets, Identity Platform) needs Terraform changes first: the API in `GCP_SERVICES_TO_ENABLE` and the resource itself.

## 7. Local development

- `mise run dev` = `docker compose up --build --watch` over `.config/docker-compose.yml`, which only `include:`s each `src/<name>/compose.yml`.
- A component's `compose.yml` uses `Dockerfile.dev` and `platform: linux/amd64` (section 3). Paths in it are relative to the component folder.
- **Compose Watch, not bind mounts, for source code.** Each service declares `develop.watch`:
  - `sync` of the component folder to the container's workdir: the dev server's own reload (Next HMR, uvicorn `--reload`) picks the copied files up;
  - `rebuild` on the dependency manifests and lockfiles (`package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`): dependencies are installed in the image and nowhere else;
  - `sync+restart` on files that a start-up step reads (e.g. `migrations/` when the service's `command` runs `alembic upgrade head && … && exec uvicorn …`): the container restarts and applies them, without restarting the stack. Exclude that folder from the plain `sync` (`ignore`). A one-time step runs in the service's own `command`, not in a separate one-shot container: locally there is one instance.

  Do not mount the source (`.:/app`) or keep dependency folders in anonymous volumes (`/app/node_modules`, `/venv`): compose reuses anonymous volumes across rebuilds, so after a dependency change the container keeps the old packages until `docker compose up -V`.
- Watch never re-reads `compose.yml` itself: new `environment` entries, volumes, ports or a changed `command` apply only after restarting `mise run dev`. Say so whenever you change a `compose.yml`.
- Watch skips everything in the component's `.dockerignore` (dependency folders, build caches, and `Dockerfile*`, so a `Dockerfile.dev` change needs a manual `docker compose up --build`).
- **A change to a `compose.yml` itself (environment, volumes, ports) is not watched:** a running `mise run dev` keeps the old configuration and recreates containers with it on the next rebuild. Restart `mise run dev`. To recreate one service by hand, name the project: `docker compose -p <repo folder> -f .config/docker-compose.yml up -d --build --no-deps <service>`; without `-p` compose takes the project name from `.config` and starts a second, empty stack.

```yaml
# src/<name>/compose.yml (Next.js; for uvicorn watch pyproject.toml and uv.lock instead)
services:
  web:
    build: { context: ., dockerfile: Dockerfile.dev }
    platform: linux/amd64
    ports: ["3000:3000"]
    develop:
      watch:
        - { action: sync, path: ., target: /app }
        - { action: rebuild, path: package.json }
        - { action: rebuild, path: package-lock.json }
```
- Local ports differ from production (e.g. Next on 3000, uvicorn on 8000). Set the `<NAME>_URL` variables a service needs locally in its `compose.yml` `environment`, pointing at `http://<service>:<port>` inside the compose network or `http://localhost:<port>` for the browser.
- Google credentials locally: mount `${HOME}/.config/gcloud:/gcloud:ro` and set `GOOGLE_APPLICATION_CREDENTIALS=/gcloud/application_default_credentials.json` and `GOOGLE_CLOUD_PROJECT` in `compose.yml`.
- Tools: each component's `mise.toml` pins its runtime (node, python, uv); `mise install --monorepo` installs all of them. Repo-wide tools (terraform, lefthook, gum) are in the root `mise.toml`.

## 8. Checks

- `src/<name>/lefthook.yml` declares the component's hooks; the root `.config/lefthook.yml` picks them up with `extends: src/*/lefthook.yml`. Use `root: src/<name>/` and prefix job names with the component name.
- Hooks run only where lefthook is installed, only on staged files, and `git commit --no-verify` skips them. So the components' checks also run in `.github/workflows/checks.yml` on every push to any branch (not on `pull_request` too: a pull request shows its head commit's run, and both triggers would run everything twice; a newer push to the same branch cancels the older run): one job per component, each running the **whole-project** versions of its hooks (ESLint, tsc, Steiger and Prettier over everything; ruff, mypy and pytest, whose PostgreSQL testcontainers starts on the runner's Docker). Tool versions come from the component's `mise.toml`. Adding a component means adding its job there.
- Make the checks required for merging: in GitHub, a branch ruleset on `main` requiring the "Checks" jobs to pass. `terraform.yml` still deploys on every push to `main`, so a red check that is not required does not stop a deploy.
- GitHub Actions also runs Terraform (fmt, validate, plan on PR, apply on `main`). A broken production image is first noticed on deploy: build it locally before pushing (`docker build src/<name>`, amd64 by default here).

## 9. Checklist: new or changed component

1. Folder name valid and intentional (`frontend` for the main site); rename = new domain.
2. `Dockerfile` listens on `$PORT`, non-root, builds for `linux/amd64`, has a `.dockerignore`.
3. `service.json` only if defaults do not fit; no secrets in it; minimal `roles`.
4. Other services addressed through `<NAME>_URL`, read at runtime.
5. `compose.yml` + `Dockerfile.dev` work with `mise run dev`; compose file listed in `.config/docker-compose.yml`.
6. `lefthook.yml` jobs pass, and the component has a job in `.github/workflows/checks.yml`; `mise run agents` run for the new stack.
7. New GCP APIs or resources added to Terraform before code depends on them.
