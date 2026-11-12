---
name: platform
description: "Use whenever you add, rename, remove or configure a component under src/, write a Dockerfile, compose.yml, service.json or lefthook.yml for one, read another service's URL, set environment variables or GCP permissions for a service, or wonder how code gets deployed. Describes this repo's platform: each src/<name> with a Dockerfile is a Cloud Run service on its own subdomain, deployed by Terraform from GitHub Actions; local dev runs through docker compose and mise."
license: MIT
metadata:
  version: "1.0.0"
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

- `mise run dev` = `docker compose up --build` over `.config/docker-compose.yml`, which only `include:`s each `src/<name>/compose.yml`.
- A component's `compose.yml` uses `Dockerfile.dev`, `platform: linux/amd64` (section 3), mounts the source for hot reload and keeps dependency folders in anonymous volumes. Paths in it are relative to the component folder.
- Local ports differ from production (e.g. Next on 3000, uvicorn on 8000). Set the `<NAME>_URL` variables a service needs locally in its `compose.yml` `environment`, pointing at `http://<service>:<port>` inside the compose network or `http://localhost:<port>` for the browser.
- Google credentials locally: mount `${HOME}/.config/gcloud:/gcloud:ro` and set `GOOGLE_APPLICATION_CREDENTIALS=/gcloud/application_default_credentials.json` and `GOOGLE_CLOUD_PROJECT` in `compose.yml`.
- Tools: each component's `mise.toml` pins its runtime (node, python, uv); `mise install --monorepo` installs all of them. Repo-wide tools (terraform, lefthook, gum) are in the root `mise.toml`.

## 8. Checks

- `src/<name>/lefthook.yml` declares the component's hooks; the root `.config/lefthook.yml` picks them up with `extends: src/*/lefthook.yml`. Use `root: src/<name>/` and prefix job names with the component name.
- Hooks run locally only; GitHub Actions runs Terraform (fmt, validate, plan on PR, apply on `main`), not the components' lint or tests. A broken production image is first noticed on deploy: build it locally before pushing (`docker build src/<name>`, amd64 by default here).

## 9. Checklist: new or changed component

1. Folder name valid and intentional (`frontend` for the main site); rename = new domain.
2. `Dockerfile` listens on `$PORT`, non-root, builds for `linux/amd64`, has a `.dockerignore`.
3. `service.json` only if defaults do not fit; no secrets in it; minimal `roles`.
4. Other services addressed through `<NAME>_URL`, read at runtime.
5. `compose.yml` + `Dockerfile.dev` work with `mise run dev`; compose file listed in `.config/docker-compose.yml`.
6. `lefthook.yml` jobs pass; `mise run agents` run for the new stack.
7. New GCP APIs or resources added to Terraform before code depends on them.
