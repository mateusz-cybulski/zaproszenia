---
name: api-structure
description: "Use when adding, moving or reviewing code in a FastAPI component of this repo (src/<name> with fastapi in pyproject.toml): where a new SQLAlchemy model, Pydantic schema, router, shared field type or service function goes, how the files are named, what app/models/__init__.py must import, and how a new model reaches Alembic migrations, how reference data (rows the app ships, e.g. default categories) gets into the database, how deleting user data works (soft delete with restore by default), how routers share lookups such as the user's own order or 404 (dependencies in app/dependencies.py, never imports between routers), how list endpoints are paged (Pagination, Page, paginate), and how endpoints stay robust: uploaded files checked for what processing them costs (page sizes, pixel budgets), join rows inserted with on_conflict_do_nothing, missing stored files, and no API docs in production."
license: MIT
metadata:
  version: "1.7.1"
---

# FastAPI component layout: one module per model, per resource

A FastAPI component (`src/<name>/`, package `app`) is organised by layer, with one file per model or per resource inside each layer. FastAPI and SQLAlchemy details are in `fastapi-expert`; tooling (uv, ruff, mypy, pytest) in `python-tooling`; Google Cloud clients in `gcp-backend`.

```
src/<name>/app/
  main.py             FastAPI app, lifespan, include_router for every router
  settings.py         Settings (pydantic-settings), get_settings()
  db.py               engine, sessionmaker, Session dependency
  auth.py             current-user dependency (if the API has users)
  dependencies.py     lookups several routers share, as dependencies (OwnOrder)
  models/
    __init__.py       imports and re-exports EVERY model (see below)
    base.py           Base, NAMING_CONVENTION, TextLimit, shared column helpers (e.g. str_enum)
    order.py          Order + the enums and constants that belong to it
    order_item.py     association model, in its own module
  schemas/
    __init__.py       empty
    common.py         field types shared by several resources (TextField, Country, ...)
    orders.py         OrderWrite, OrderRead, ...
  routers/
    __init__.py       empty
    orders.py         APIRouter(prefix="/orders")
    order_items.py    APIRouter(prefix="/orders/{order_id}/items"), a nested resource
  services/           only once logic outgrows the endpoints (see below)
    __init__.py       empty
    orders.py
  <task>.py           one-off command run as `python -m app.<task>` (see "Reference data")
```

Start with this layout even for a single model: moving from `models.py` to `models/` later is churn, and the structure is the same for one model as for ten.

## Naming

| Layer | File | Holds |
|---|---|---|
| `models/` | singular entity: `order.py`, `customer.py` | one table's model class, plus enums and constants that belong to it |
| `schemas/` | plural resource, same as its router: `orders.py` | request/response bodies and value types of that resource |
| `routers/` | plural resource = URL prefix: `orders.py` -> `/orders` | the `APIRouter` with its endpoints |
| `services/` | plural resource: `orders.py` | business logic as plain functions taking the session and models |

- An association table or a model that only exists for another one gets its own module, named after itself (`order_item.py`).
- An enum used by several models lives in the model module that owns it; others import it from `app.models`.
- Field types used by more than one resource go to `schemas/common.py`, never copied between schema modules. Name them by what they hold, never by their limit (`Text300`); the text types that differ only by limit and optionality are members of `TextField` (`TextField.OptionalShort`), see `clean-code`.
- Text lengths are defined once, in `TextLimit` in `models/base.py`: the column (`String(TextLimit.SHORT)`) and the schema type (`TextField.OptionalShort`, built with `Field(max_length=TextLimit.SHORT)`) both read it. Changing a limit changes the model, so `alembic check` then asks for a migration.
- Schemas never live in a router module; models never live in a schema module.
- Logic longer than a few lines in an endpoint, or shared by several routers, goes to `services/<resource>.py`. Create the package when the first such function appears; endpoints stay thin (parse, call, return).
- **Routers never import from each other.** A nested resource gets its own router module (`order_items.py` for `/orders/{order_id}/items`), and what both need goes one level down (see below).

## Lists are paged from the start

Every endpoint that returns a list of user data is paged, even while the lists are short:

```python
@router.get("")
async def list_customers(session: Session, user: CurrentUser, pagination: Pagination, ...) -> Page[CustomerRead]:
    statement = select(Customer).where(...).order_by(Customer.id)
    customers, total = await paginate(session, statement, pagination)
    return Page[CustomerRead](items=[...], total=total, page=pagination.page, page_size=pagination.page_size)
```

- `Pagination` (`app/dependencies.py`) reads `?page=` (from 1) and `?page_size=` (default 100, at most 500); `Page[Item]` (`schemas/pagination.py`) is `{items, total, page, page_size}`; `paginate()` (`services/pagination.py`) counts the filtered statement and fetches one page with limit and offset.
- **The ordering ends on a unique column** (`..., Customer.id`), or rows move between pages.
- A page past the end returns empty `items` with the real `total`, not 404.
- Filters that a picker needs run on the server (`?q=`, `?not_in_order=`), and "select all matching" is its own endpoint (`POST /orders/{id}/items/matching` with the same search) doing one `INSERT ... SELECT`, never ids gathered page by page in the browser.
- Small reference lists the app ships (countries, categories) stay unpaged.

## Shared lookups are dependencies

Loading "the user's own X from the path, or 404" is written once. While only one router uses it, it is a private helper there (`_own_customer`). As soon as a second router needs it, it moves to `app/dependencies.py` as a FastAPI dependency, so endpoints receive the loaded object instead of calling a helper:

```python
# app/dependencies.py
async def find_own_order(session: Session, order_id: int, owner_uid: str, *, deleted: bool | None = False) -> Order:
    order = await session.get(Order, order_id)
    if order is None or order.owner_uid != owner_uid:  # someone else's looks like a missing one
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    if deleted is not None and (order.deleted_at is not None) != deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    return order

async def _active_own_order(order_id: int, session: Session, user: CurrentUser) -> Order:
    return await find_own_order(session, order_id, user.uid)

OwnOrder = Annotated[Order, Depends(_active_own_order)]

# app/routers/order_items.py
@router.patch("/{item_id}")
async def update_order_item(order: OwnOrder, item_id: int, payload: OrderItemUpdate, session: Session) -> OrderItemRead:
    ...
    await session.commit()
```

- Name the alias `Own<Model>` for the active object; keep the plain function (`find_own_<model>`) public next to it for the variants a dependency does not cover (deleted objects in restore and permanent delete).
- The dependency gets `order_id` from the path by name, and shares the request's `Session` (FastAPI caches dependencies per request), so the object belongs to the endpoint's session.
- **Transactions:** the lookup already started the session's transaction (autobegin), so an endpoint that takes `Own<Model>` ends its writes with `await session.commit()`; `async with session.begin()` would fail with "a transaction is already begun". If the endpoint raises before committing, closing the session rolls everything back.
- Services stay free of HTTP: they never raise `HTTPException`; the 404 lives in the dependency.

## models/__init__.py is mandatory

Alembic autogenerate and `alembic check` only see tables registered on `Base.metadata`, i.e. tables whose module was imported. `migrations/env.py` imports `app.models` (`from app.models import Base`), so:

1. Every new model module is imported in `app/models/__init__.py` and its public names added to `__all__`.
2. Code outside the package imports models from it: `from app.models import Order`, not `from app.models.order import Order`. Inside `app/models/`, modules import each other by full path (`from app.models.base import Base`) to avoid import cycles through `__init__`.
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
from app.models.order import Order, OrderStatus

__all__ = ["Base", "Order", "OrderStatus"]
```

Schemas and routers are imported by module path (`from app.schemas.orders import OrderRead`, `from app.routers import orders`); their `__init__.py` is empty.

## Adding a model, step by step

1. `app/models/<entity>.py` with the model.
2. Import it in `app/models/__init__.py`.
3. Migration: `uv run alembic revision --autogenerate -m "<what changed>"`, then read and fix the generated file: data migrations, server defaults for existing rows (add, backfill, then drop the default if the model has none), and the order of steps in `downgrade`.
4. `app/schemas/<resource>.py` and `app/routers/<resource>.py`; register the router in `main.py`.
5. Tests in `tests/test_<resource>.py`; `uv run pytest -q` also runs the migration drift check.

## Deleting user data: soft delete by default

When a user deletes something they created (customers, orders, contacts), suggest a soft delete with restore before writing a plain `DELETE`. People delete by mistake, and a restore is cheaper than a support request. Hard delete stays available for data that must really go (privacy requests, clean-up). Skip soft delete only for data with no value once removed (sessions, caches, join rows that are rebuilt), and say why.

1. Model: `deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))`, NULL for active rows. A timestamp, not a boolean, so the restore list can show when and sort newest first. Migration: a nullable column, no backfill.
2. Every read and bulk operation filters `Model.deleted_at.is_(None)`: lists, search, counts, "verify all", exports. A deleted row behaves like a missing one, so `GET/PUT/POST /{id}/...` return 404. Put the check in the shared ownership helper (`_own_<entity>(..., deleted=False)`, with `True` for deleted rows only and `None` for either), not in each endpoint.
3. Endpoints:

| Endpoint | Does |
|---|---|
| `DELETE /<resource>/{id}` | soft delete: sets `deleted_at = now()`, 204 |
| `DELETE /<resource>/{id}?permanent=true` | hard delete, for an active or an already deleted row, 204 |
| `GET /<resource>?deleted=true` | only deleted rows, newest `deleted_at` first |
| `POST /<resource>/{id}/restore` | clears `deleted_at`, returns the row; 404 if it is not deleted |

4. Files in storage and child rows: a soft delete keeps them; only the hard delete removes them (after the commit, see `gcp-backend`).
5. Tests: a soft-deleted row leaves the list and reappears after restore; it is 404 for read, update and its actions, and skipped by bulk operations; hard delete works on active and deleted rows; all of it is private to the owner.
6. Unique constraints that should allow re-creating a deleted row need a partial index (`WHERE deleted_at IS NULL`).

## Reference data: rows the app ships

Rows that the code defines and every user sees (default categories, built-in plans) are not created by the API process: several instances start at once on Cloud Run, and the API's startup must stay fast and free of writes.

1. Keep the definitions in code (`services/<resource>.py`) and write an idempotent sync: an upsert keyed on a unique column (`insert(...).on_conflict_do_update(index_elements=[Model.system_key], ...)`) plus deleting rows whose key is no longer defined.
2. Expose it as a module command, `app/<task>.py` with `asyncio.run(main())`, e.g. `python -m app.default_categories`.
3. Run it right after `alembic upgrade head`: in the API service's start `command` in `compose.yml` (before `exec uvicorn`) and in the "Migrate database" step of `.github/workflows/terraform.yml`. Production never migrates in the API process: several instances would race.
4. Tests run it once after migrating the test database, and clean up only user rows between tests, not the reference rows.
5. A data migration is the wrong place: migrations are frozen history, while reference rows follow the current code.

## Robust endpoints: files, join rows, the public surface

Rules from the security review; each one closed a real gap.

- **A file from a user is checked for what processing it costs, not only for its byte size.** A 470-byte PDF with a page 1 pt wide passed a 15 MB limit and asked the preview for a 54 GiB bitmap. Check the properties the code later depends on (page count, page sides, image dimensions) right after upload, with named limits (a minimum and maximum page side), and bound the output of every rendering step (a pixel budget in the renderer) too, so files stored before a check are safe as well. Add a test with the hostile file.
- **Inserting join rows tolerates a concurrent duplicate.** Two tabs can add the same item to an order at once; a plain insert then fails on the primary key with a 500. Insert with `insert(Model).values(...).on_conflict_do_nothing()` (or `from_select` + `on_conflict_do_nothing`) and count what was really inserted with `.returning(...)`.
- **A generated file made of many copies of one template shares the template.** Merging rendered copies (`writer.append(render(...))` per customer) stores the template's images and fonts once per copy: 300 letters on a 1 MB background were 341 MB, built in memory on a 512 MiB instance. Add every copy's pages from **one** `PdfReader` of the template (`writer.add_page(base_page)`, so pypdf shares its resources), draw only the per-copy layer on top, then `writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)`: the same 300 were 3 MB in about 2 s. Measure size, time and peak memory for the largest expected list.
- **A stored file may be missing.** Any `storage.get()` of a key from the database handles `FileNotFoundError` (an object removed by hand, a failed upload): return a clear 404/409 with a message for the user, never a 500.
- **Interactive API docs only outside production.** `FastAPI(docs_url=None, redoc_url=None, openapi_url=None)` when running on Cloud Run (`K_SERVICE` is set); locally `/docs` stays. The schema is still generated in tests and by `app.openapi()`.

