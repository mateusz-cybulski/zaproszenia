import os
from collections.abc import AsyncIterator, Iterator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from testcontainers.community.postgres import PostgresContainer

from app.main import app
from app.settings import get_settings

API_ROOT = Path(__file__).parent.parent


@pytest.fixture(scope="session", autouse=True)
def database() -> Iterator[None]:
    """A throwaway PostgreSQL for the whole run, migrated with Alembic."""
    with PostgresContainer("postgres:18-alpine", driver="psycopg") as postgres:
        os.environ["DATABASE_URL"] = postgres.get_connection_url()
        get_settings.cache_clear()
        command.upgrade(Config(str(API_ROOT / "alembic.ini")), "head")
        yield
    get_settings.cache_clear()


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as test_client:
            yield test_client
        async with app.state.sessionmaker() as session, session.begin():
            await session.execute(text("TRUNCATE guests RESTART IDENTITY"))
