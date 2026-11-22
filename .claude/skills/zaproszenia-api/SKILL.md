---
name: zaproszenia-api
description: "Use when adding or changing code in this project's API (src/api, FastAPI): the project's own helpers and where they live (Pagination, Page and paginate; OwnEvent, find_own_event and find_visible_template; the system templates sync; PageSide and the preview pixel budget; StoredFileMissingError; the Morfeusz wrapper and declension). Project-specific; the general rules are in api-structure, fastapi-expert, python-tooling, gcp-backend and polish-nlp."
license: MIT
metadata:
  version: "1.1.0"
---

# API conventions of this project

What the shared skills describe as patterns, by the names this API uses. Synced skills (`mise run agents`) are replaced on every sync, so project-only rules live here.

## 1. Shared helpers

| Pattern (shared skill) | Here |
|---|---|
| Paged lists (`api-structure`) | `Pagination` in `app/dependencies.py` (`?page=` from 1, `?page_size=` default 100, at most 500), `Page[Item]` in `app/schemas/pagination.py` (`{items, total, page, page_size}`), `paginate()` in `app/services/pagination.py` |
| The user's own record or 404 (`api-structure`) | `find_own_event(session, event_id, owner_uid, *, deleted=False)` and `OwnEvent` in `app/dependencies.py`; `find_visible_template()` for a template the user owns or a system one |
| Reference rows the app ships (`api-structure`) | the system templates: definitions in code, synced by `python -m app.system_templates` right after `alembic upgrade head` |
| Upload limits by processing cost (`api-structure`) | `PageSide.MIN_MM` / `PageSide.MAX_MM` (20–1000 mm) checked on upload in `app/services/pdf.py`; `PREVIEW_MAX_PIXELS` (4 M) bounds `render_png` |
| One template shared by many copies (`api-structure`) | `render_all()` in `app/services/pdf.py`: all guests' pages from one `PdfReader`, then `compress_identical_objects` |
| A stored file may be missing (`api-structure`) | `StoredFileMissingError` from `app/storage.py`, turned into a 409 by a handler in `app/main.py` |
| Polish morphology (`polish-nlp`) | `app/morphology.py` (typed wrapper, one instance per thread) and `app/services/declension.py` (names, positions, institutions) |

## 2. Domain

- Nested resources: `/events/{event_id}/guests` (`app/routers/event_guests.py`), documents at `POST /events/{id}/documents/{invitation|envelope}` with 409 codes `no_guests`, `no_template`, `needs_confirmation`.
- `PUT /events/{id}` saves the details and both template ids in one request (the frontend's event dialog); there is no endpoint for the templates alone.
- User-facing error messages are in Polish.
