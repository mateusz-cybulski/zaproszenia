---
name: api-structure
description: "Use when adding, moving or reviewing code in a FastAPI component of this repo (src/<name> with fastapi in pyproject.toml): where a new SQLAlchemy model, Pydantic schema, router, shared field type or service function goes, how the files are named, what app/models/__init__.py must import, and how a new model reaches Alembic migrations."
license: MIT
metadata:
  version: "1.0.0"
---

# FastAPI component layout: one module per model, per resource

A FastAPI component (`src/<name>/`, package `app`) is organised by layer, with one file per model or per resource inside each layer. FastAPI and SQLAlchemy details are in `fastapi-expert`; tooling (uv, ruff, mypy, pytest) in `python-tooling`; Google Cloud clients in `gcp-backend`.

```
src/<name>/app/
  main.py             FastAPI app, lifespan, include_router for every router
  settings.py         Settings (pydantic-settings), get_settings()
  db.py               engine, sessionmaker, Session dependency
  auth.py             current-user dependency (if the API has users)
  models/
    __init__.py       imports and re-exports EVERY model (see below)
    base.py           Base, NAMING_CONVENTION, shared column helpers (e.g. str_enum)
    event.py          Event + the enums and constants that belong to it
    event_guest.py    association model, in its own module
  schemas/
    __init__.py       docstring only
    common.py         field types shared by several resources (Text300, PostalCode, ...)
    events.py         EventWrite, EventRead, ...
  routers/
    __init__.py       docstring only
    events.py         APIRouter(prefix="/events")
  services/           only once logic outgrows the endpoints (see below)
    events.py
```

Start with this layout even for a single model: moving from `models.py` to `models/` later is churn, and the structure is the same for one model as for ten.

## Naming

| Layer | File | Holds |
|---|---|---|
| `models/` | singular entity: `event.py`, `guest.py` | one table's model class, plus enums and constants that belong to it |
| `schemas/` | plural resource, same as its router: `events.py` | request/response bodies and value types of that resource |
| `routers/` | plural resource = URL prefix: `events.py` -> `/events` | the `APIRouter` with its endpoints |
| `services/` | plural resource: `events.py` | business logic as plain functions taking the session and models |

- An association table or a model that only exists for another one gets its own module, named after itself (`event_guest.py`).
- An enum used by several models lives in the model module that owns it; others import it from `app.models`.
- Field types used by more than one resource go to `schemas/common.py`, never copied between schema modules.
- Schemas never live in a router module; models never live in a schema module.
- Logic longer than a few lines in an endpoint, or shared by several routers, goes to `services/<resource>.py`. Create the package when the first such function appears; endpoints stay thin (parse, call, return).

## models/__init__.py is mandatory

Alembic autogenerate and `alembic check` only see tables registered on `Base.metadata`, i.e. tables whose module was imported. `migrations/env.py` imports `app.models` (`from app.models import Base`), so:

1. Every new model module is imported in `app/models/__init__.py` and its public names added to `__all__`.
2. Code outside the package imports models from it: `from app.models import Event`, not `from app.models.event import Event`. Inside `app/models/`, modules import each other by full path (`from app.models.base import Base`) to avoid import cycles through `__init__`.
3. A model missing from `__init__` produces a migration that **drops its table**. Guard against it with a test that runs `alembic check` on the migrated test database:

```python
# tests/test_migrations.py
from alembic import command
from alembic.config import Config

def test_migrations_match_models() -> None:
    command.check(Config("alembic.ini"))
```

```python
# app/models/__init__.py
"""Database models, one module per model. Import every model module here (Alembic)."""

from app.models.base import Base
from app.models.event import Event, EventStatus

__all__ = ["Base", "Event", "EventStatus"]
```

Schemas and routers are imported by module path (`from app.schemas.events import EventRead`, `from app.routers import events`); their `__init__.py` holds only a docstring.

## Adding a model, step by step

1. `app/models/<entity>.py` with the model.
2. Import it in `app/models/__init__.py`.
3. Migration: `uv run alembic revision --autogenerate -m "<what changed>"`, then read and fix the generated file: data migrations, server defaults for existing rows (add, backfill, then drop the default if the model has none), and the order of steps in `downgrade`.
4. `app/schemas/<resource>.py` and `app/routers/<resource>.py`; register the router in `main.py`.
5. Tests in `tests/test_<resource>.py`; `uv run pytest -q` also runs the migration drift check.
