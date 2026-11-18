---
name: gcp-backend
description: "Use when Python backend code in this repo talks to Google Cloud: verifying users with Identity Platform / Firebase Auth (firebase-admin, ID tokens, custom claims, tenants), issuing or checking your own JWTs with PyJWT, queuing background work with Cloud Tasks and handling those requests, storing files in Cloud Storage (uploads, downloads, signed URLs), or calling Gemini through Vertex AI with the google-genai SDK. Covers credentials (ADC), IAM roles via service.json, async usage in FastAPI, local dev and testing."
license: MIT
metadata:
  version: "1.1.0"
---

# GCP from a Python backend

Applies to Python services in `src/<name>` deployed to Cloud Run (see `platform` for how roles, env and APIs are wired, `fastapi-expert` and `python-tooling` for the app itself). Library versions checked: firebase-admin 7.7, google-cloud-tasks 2.26, google-cloud-storage 3.17, google-genai 3.0, PyJWT 2.15.

## 0. Common rules

- **Credentials: Application Default Credentials only.** On Cloud Run they are the service's own account `run-<name>@<project>.iam.gserviceaccount.com`; locally your `gcloud auth application-default login` credentials mounted into the container. Never download or commit service account keys.
- **Permissions: `roles` in `src/<name>/service.json`** grant project-level roles to that account. Use the narrowest role. A role that must apply to a single resource (one bucket, one service account) needs a Terraform binding instead: say so rather than granting a broad project role.
- **APIs: check `GCP_SERVICES_TO_ENABLE` in `.config/terraform/variables.tf` first.** Cloud Run, Artifact Registry, Secret Manager and Vertex AI are enabled. Identity Platform (`identitytoolkit.googleapis.com`), Cloud Tasks (`cloudtasks.googleapis.com`), Cloud Storage (`storage.googleapis.com`) and IAM Credentials (`iamcredentials.googleapis.com`, for keyless signing) must be added there, and their resources (queues, buckets) created in Terraform, before code depends on them.
- **Blocking clients in async code.** `firebase_admin.auth`, `google.cloud.storage` and `google.oauth2.id_token` are synchronous and do network I/O. In `async def` endpoints call them with `await asyncio.to_thread(...)` (or make the endpoint a plain `def`). Cloud Tasks and google-genai have native async clients.
- **One client per process**, created in FastAPI `lifespan` or a cached factory, not per request.
- **Tests never call Google.** Wrap each client behind a small function or class, inject it with `Depends`, and override it in tests.

## 1. Users: Identity Platform / Firebase Auth

The frontend signs users in (Firebase JS SDK, Identity Platform) and sends the **ID token** as `Authorization: Bearer <token>`. The backend verifies it with firebase-admin.

```python
# app/auth.py
import asyncio
from typing import Annotated, Any

import firebase_admin
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

firebase_admin.initialize_app()  # ADC; project from GOOGLE_CLOUD_PROJECT
bearer = HTTPBearer(auto_error=False)


async def current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> dict[str, Any]:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, headers={"WWW-Authenticate": "Bearer"})
    try:
        return await asyncio.to_thread(auth.verify_id_token, credentials.credentials, check_revoked=True)
    except (auth.ExpiredIdTokenError, auth.RevokedIdTokenError, auth.UserDisabledError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired") from None
    except (auth.InvalidIdTokenError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from None


CurrentUser = Annotated[dict[str, Any], Depends(current_user)]
```

- The decoded token's `uid` is the user id; `email`, `email_verified` and custom claims are top-level keys.
- `check_revoked=True` costs an extra API call per request; use it for sensitive endpoints, or verify without it and keep token lifetime short (ID tokens last one hour).
- `auth.CertificateFetchError` means Google's keys could not be fetched: return 503, not 401.
- **Authorization with custom claims:** `auth.set_custom_user_claims(uid, {"role": "admin"})` (admin-only code path). Claims appear in the user's next ID token, so the frontend must refresh the token. Keep claims small (they travel with every request); keep everything else in the database.
- **Multi-tenancy:** `tenant_mgt.auth_for_tenant(tenant_id).verify_id_token(token)`; the token carries `firebase.tenant`. Reject tokens from other tenants.
- Locally, use the Firebase Auth emulator (`FIREBASE_AUTH_EMULATOR_HOST=host:9099`) or override `current_user` in tests; never relax verification in production code paths.
- Needs: Identity Platform enabled and configured in Terraform; no extra role for verifying tokens. Managing users (`set_custom_user_claims`, `create_user`) needs `roles/firebaseauth.admin` (or `roles/identityplatform.admin`) in `service.json`.

## 2. Your own tokens: PyJWT

Use PyJWT only for tokens **this backend issues** (signed download links, invitation or email-confirmation tokens, service-to-service tokens you define). Never verify Firebase ID tokens or Google OIDC tokens by hand with PyJWT: their keys rotate and the rules are subtle; use firebase-admin and google-auth.

```python
import datetime as dt

import jwt
from jwt.exceptions import InvalidTokenError

def issue_invite(email: str, secret: str) -> str:
    now = dt.datetime.now(dt.UTC)
    payload = {"sub": email, "aud": "invite", "iat": now, "exp": now + dt.timedelta(days=2)}
    return jwt.encode(payload, secret, algorithm="HS256")

def read_invite(token: str, secret: str) -> str:
    try:
        claims = jwt.decode(token, secret, algorithms=["HS256"], audience="invite")
    except InvalidTokenError as error:
        raise ValueError("invalid invite") from error
    return str(claims["sub"])
```

- Always pass `algorithms=[...]` and `audience=` to `decode`; always set `exp`.
- The secret comes from Secret Manager / env (`SecretStr` in settings), at least 32 random bytes.

## 3. Background work: Cloud Tasks

A request handler enqueues a task; Cloud Tasks calls an HTTP endpoint (usually a worker service, e.g. `src/worker`) with retries.

```python
# enqueue
import json

from google.cloud import tasks_v2

tasks_client = tasks_v2.CloudTasksAsyncClient()  # create once (lifespan)

async def enqueue_export(order_id: int, settings: Settings) -> None:
    task = tasks_v2.Task(
        name=tasks_client.task_path(settings.google_cloud_project, settings.tasks_location,
                                    "exports", f"export-{order_id}"),  # dedupe key
        http_request=tasks_v2.HttpRequest(
            http_method=tasks_v2.HttpMethod.POST,
            url=f"{settings.worker_url}/tasks/export",  # WORKER_URL from the platform
            headers={"Content-Type": "application/json"},
            body=json.dumps({"order_id": order_id}).encode(),
            oidc_token=tasks_v2.OidcToken(
                service_account_email=settings.tasks_invoker_email,
                audience=settings.worker_url,
            ),
        ),
    )
    await tasks_client.create_task(
        parent=tasks_client.queue_path(settings.google_cloud_project, settings.tasks_location, "exports"),
        task=task,
    )
```

```python
# handle (worker service)
import asyncio
from typing import Annotated

from fastapi import Header, HTTPException, Request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

@router.post("/tasks/export", status_code=204)
async def export_task(
    request: Request,
    payload: ExportPayload,
    authorization: Annotated[str, Header()],
    retry_count: Annotated[int, Header(alias="X-CloudTasks-TaskRetryCount")] = 0,
) -> None:
    token = authorization.removeprefix("Bearer ")
    claims = await asyncio.to_thread(
        id_token.verify_oauth2_token, token, google_requests.Request(), audience=settings.worker_url
    )
    if claims.get("email") != settings.tasks_invoker_email:
        raise HTTPException(403)
    await run_export(payload.order_id)  # must be idempotent
```

- **Verify the OIDC token in the handler.** Services here are public by default (`allUsers` invoker), so anyone could call `/tasks/...`. Alternatively set `"public": false` and grant `roles/run.invoker` on that service to the invoker account in Terraform. `X-CloudTasks-*` headers are informational, never proof of identity.
- **Idempotent handlers.** Delivery is at-least-once; a non-2xx response or timeout means a retry. Key side effects on the payload (upsert, "already done" checks).
- Task names deduplicate creation: creating a task whose name exists, or was used recently (the name stays reserved for a while after the task ran or was deleted), fails with `AlreadyExists`; treat that as success. Named tasks enqueue more slowly, so omit `name` when duplicates are harmless, and never reuse a name for a different job.
- Dispatch deadline: default 10 minutes, maximum 30 minutes. Longer work: split it into several tasks or use a Cloud Run job.
- Return 2xx only after the work is committed. Return 4xx for permanently bad payloads only if the queue's retry config should still retry them; otherwise log and return 204 to drop them.
- IAM: the enqueuing service needs `roles/cloudtasks.enqueuer` (service.json) and permission to act as the OIDC account (`roles/iam.serviceAccountUser` on that account, Terraform); the Cloud Tasks service agent also needs `roles/iam.serviceAccountUser` on it. The queue itself is created in Terraform.

## 4. Files: Cloud Storage

```python
import asyncio
import datetime as dt

import google.auth
from google.auth.transport.requests import Request as AuthRequest
from google.cloud import storage

storage_client = storage.Client()  # create once
credentials, _ = google.auth.default()

async def upload_url(bucket_name: str, object_name: str, content_type: str) -> str:
    def sign() -> str:
        credentials.refresh(AuthRequest())  # keyless signing via IAM signBlob
        blob = storage_client.bucket(bucket_name).blob(object_name)
        return blob.generate_signed_url(
            version="v4",
            expiration=dt.timedelta(minutes=15),
            method="PUT",
            content_type=content_type,
            service_account_email=credentials.service_account_email,
            access_token=credentials.token,
        )
    return await asyncio.to_thread(sign)
```

- **Uploads and downloads of user files go directly between the browser and GCS** through short-lived V4 signed URLs; the API only signs. Do not stream large files through Cloud Run (request size and memory limits, cost).
- Exception: the API has to read every byte of the file anyway (validate, convert or rewrite it, e.g. a PDF it normalises) and files are small (up to ~15 MB, under Cloud Run's 32 MiB request limit). Then the upload goes through the API as `multipart/form-data` (needs `python-multipart`): read at most limit + 1 bytes and answer 413 above the limit. Signed URLs would only add a second round trip to fetch the file back.
- On Cloud Run there is no private key: signing uses the IAM `signBlob` API with `service_account_email` + `access_token`, which needs the IAM Credentials API and `roles/iam.serviceAccountTokenCreator` **on the service's own account** (Terraform binding; a project-level grant would let it impersonate every account).
- Object names: generated (`uploads/<uuid>`, or `users/<uid>/<resource>/<id>.<ext>` from the database id) never raw user filenames; store the original name in the database.
- Keep the database and the bucket consistent: insert the row and `flush()` to get its id, store the file, then commit; if the commit fails, delete the file just stored. On delete, commit first and delete the file afterwards (a leftover file is harmless, a row pointing at a missing file is not). Copying a row copies its file to a new key. Validate `content_type` and size (signed URL conditions or a check after upload).
- Bucket access: `roles/storage.objectUser` (read/write) or `roles/storage.objectViewer`, granted on the bucket (`google_storage_bucket_iam_member`), not as a project role in `service.json`; bucket with uniform access and public access prevention, created in Terraform, its name injected into the service as an env var (e.g. `STORAGE_BUCKET`).
- Put storage behind a small `Protocol` (`put`/`get`/`delete`, async via `asyncio.to_thread`) with a GCS and a local-directory implementation, chosen by settings, and inject it with `Depends` so tests override it with a temporary directory. Locally: the local directory on a named compose volume, a separate dev bucket with your ADC credentials, or `fake-gcs-server`. A local-directory implementation must reject keys that resolve outside its root.
- The `google-cloud-storage` package has no type information: import `from google.cloud.storage import Client` and add `google.cloud.storage` and `google.cloud.storage.*` to the scoped mypy override (see `python-tooling`).

## 5. Gemini through Vertex AI (google-genai)

Use the Google Gen AI SDK (`google-genai`), not the old `vertexai.generative_models` module.

```python
from google import genai
from google.genai import types
from pydantic import BaseModel

client = genai.Client(enterprise=True, project=settings.google_cloud_project, location="global")

class InvoiceFields(BaseModel):
    number: str
    total: float
    currency: str

async def extract_invoice(text: str) -> InvoiceFields:
    response = await client.aio.models.generate_content(
        model=settings.gemini_model,
        contents=f"Extract the invoice fields from:\n\n{text}",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=InvoiceFields,
            temperature=0,
        ),
    )
    return InvoiceFields.model_validate_json(response.text or "")
```

- `enterprise=True` (env `GOOGLE_GENAI_USE_ENTERPRISE=true`) selects Vertex AI with ADC in google-genai 3.x; `vertexai=True` / `GOOGLE_GENAI_USE_VERTEXAI` is the older name and still works. Without either, the SDK targets the Gemini Developer API with an API key: never do that here.
- Location `global` unless data residency requires a region.
- **Model name from settings** (`GEMINI_MODEL`), never hard-coded in many places: models are versioned and retired. Pick a GA model from https://cloud.google.com/vertex-ai/generative-ai/docs/models and prefer the Flash tier unless quality demands Pro.
- Structured output: `response_schema` with a Pydantic model, then validate with `model_validate_json`; still handle validation errors (the model can return incomplete data).
- Use `client.aio` in async code. Set timeouts and retry only on 429/5xx with backoff.
- Prompt inputs from users are untrusted: do not let model output trigger actions without validation.
- IAM: `roles/aiplatform.user` in `service.json`. Vertex AI is already enabled for every project.
- Tests: fake the function that calls the model; a small number of opt-in integration tests may call the real API.
