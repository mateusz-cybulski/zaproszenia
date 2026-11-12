# Project setup: settings, lifespan, PostgreSQL (psycopg 3), Alembic

Added for this repo (not part of the original plugin). Tooling (uv, ruff, mypy, pytest, Dockerfile) is in the `python-tooling` skill; deployment rules are in `platform`.

## Settings (pydantic-settings)

```python
# app/settings.py
from functools import lru_cache

from pydantic import PostgresDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: PostgresDsn
    jwt_secret: SecretStr
    google_cloud_project: str | None = None  # set by the platform on Cloud Run
    frontend_url: str = "http://localhost:3000"  # FRONTEND_URL on Cloud Run


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # values come from the environment
```

- Field names map to upper-case env vars (`database_url` <- `DATABASE_URL`). Platform-injected variables (`GOOGLE_CLOUD_PROJECT`, `<NAME>_URL`) fit straight in.
- Secrets as `SecretStr`; read them with `.get_secret_value()` only where used. Secrets come from Secret Manager or the environment, never from `service.json`.
- Use `Depends(get_settings)` in endpoints so tests can override it with `app.dependency_overrides`.

## Lifespan (startup/shutdown)

`@app.on_event` is deprecated; use `lifespan`. Create shared clients once, close them on shutdown.

```python
# app/main.py
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import create_engine_and_sessionmaker


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    engine, sessionmaker = create_engine_and_sessionmaker()
    app.state.sessionmaker = sessionmaker
    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan)
```

Keep startup fast: Cloud Run scales to zero, so every cold start runs `lifespan`. Do not run migrations or warm caches here.

## SQLAlchemy 2 + psycopg 3

- Driver: psycopg 3 (`uv add "psycopg[binary]" sqlalchemy`). URL scheme `postgresql+psycopg://`. The same URL works for `create_engine` and `create_async_engine` (SQLAlchemy picks the async variant). Plain `postgresql://` means psycopg2: do not use it.
- Do not mix in asyncpg examples (`postgresql+asyncpg://`) from other references; this project uses psycopg 3.

```python
# app/db.py
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.settings import get_settings


def create_engine_and_sessionmaker() -> tuple[AsyncEngine, async_sessionmaker[AsyncSession]]:
    engine = create_async_engine(
        str(get_settings().database_url),  # postgresql+psycopg://user:pass@host/db
        pool_size=5,
        max_overflow=5,
        pool_pre_ping=True,
    )
    return engine, async_sessionmaker(engine, expire_on_commit=False)


async def get_session(request: Request) -> AsyncIterator[AsyncSession]:
    async with request.app.state.sessionmaker() as session:
        yield session


Session = Annotated[AsyncSession, Depends(get_session)]
```

- Pool size per instance times `max_instances` (from `service.json`) must stay below the database's connection limit.
- Commit explicitly in the endpoint or service function that owns the transaction (`async with session.begin():`), not in the dependency.
- Timestamps: `DateTime(timezone=True)` columns with `server_default=func.now()`; in Python `datetime.now(timezone.utc)`, never naive datetimes.

## Alembic

- Set up with the async template: `uv run alembic init -t async migrations`. In `migrations/env.py`, set `target_metadata = Base.metadata` and read the URL from settings instead of `alembic.ini`:

```python
# migrations/env.py (async template), near the top
from app.models import Base
from app.settings import get_settings

config.set_main_option("sqlalchemy.url", str(get_settings().database_url))
target_metadata = Base.metadata
```

- New migration: `uv run alembic revision --autogenerate -m "add orders table"`. Always read the generated file: autogenerate misses renames (it emits drop + add, losing data), server defaults, some constraint and enum changes.
- One migration per logical change; every migration has a working `downgrade()`.
- Backwards-compatible migrations only (expand, then contract in a later deploy): Cloud Run keeps old instances serving while new ones start, so the old code must work with the new schema. Renaming a column = add new, backfill, switch code, drop old later.
- Apply: `uv run alembic upgrade head`. In tests, run migrations against the disposable test database instead of `Base.metadata.create_all()`, so migrations are tested too.

### Running migrations on Cloud Run

The platform (see `platform`) has no migration step and no database yet: Cloud SQL, its connection and the migration run must be added to Terraform first. Recommended shape:

- a Cloud Run **job** using the same image with the command `alembic upgrade head`, executed by the deploy workflow after the image is built and before the service is updated;
- not in `lifespan` and not in the container `CMD`: several instances would race to migrate, and a failing migration would crash-loop the service.

Until that exists, say so when a change needs a migration, instead of wiring migrations into app startup.
