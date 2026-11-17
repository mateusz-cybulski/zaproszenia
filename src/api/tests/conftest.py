import os
from collections.abc import AsyncIterator, Iterator
from datetime import timedelta
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from testcontainers.community.postgres import PostgresContainer

from app.auth import AuthUser, EmailNotVerifiedError, InvalidCredentialsError, get_identity
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


VALID_ID_TOKEN = "valid-id-token"  # noqa: S105 - fake token, never sent to Google
SESSION_COOKIE = "session-cookie"
UNVERIFIED_ID_TOKEN = "unverified-id-token"  # noqa: S105 - fake token, never sent to Google
OTHER_SESSION_COOKIE = "other-session-cookie"
USER = AuthUser(uid="user-1", email="jan@example.com")
OTHER_USER = AuthUser(uid="user-2", email="anna@example.com")


class FakeIdentity:
    """Identity Platform stand-in: one known ID token and one session cookie."""

    def __init__(self) -> None:
        self.revoked: list[str] = []
        self.session_lifetimes: list[timedelta] = []

    async def create_session(self, id_token: str, expires_in: timedelta) -> str:
        if id_token == UNVERIFIED_ID_TOKEN:
            raise EmailNotVerifiedError("email address is not verified")
        if id_token != VALID_ID_TOKEN:
            raise InvalidCredentialsError("bad ID token")
        self.session_lifetimes.append(expires_in)
        return SESSION_COOKIE

    async def verify_session(self, session_cookie: str) -> AuthUser:
        users = {SESSION_COOKIE: USER, OTHER_SESSION_COOKIE: OTHER_USER}
        user = users.get(session_cookie)
        if user is None or user.uid in self.revoked:
            raise InvalidCredentialsError("bad session cookie")
        return user

    async def revoke_sessions(self, uid: str) -> None:
        self.revoked.append(uid)


@pytest.fixture
def identity() -> Iterator[FakeIdentity]:
    fake = FakeIdentity()
    app.dependency_overrides[get_identity] = lambda: fake
    yield fake
    app.dependency_overrides.pop(get_identity, None)


@pytest.fixture
async def anonymous_client(identity: FakeIdentity) -> AsyncIterator[AsyncClient]:
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as test_client:
            yield test_client
        async with app.state.sessionmaker() as session, session.begin():
            await session.execute(text("TRUNCATE guests RESTART IDENTITY"))


@pytest.fixture
def client(anonymous_client: AsyncClient) -> AsyncClient:
    """Signed in as USER."""
    anonymous_client.headers["Authorization"] = f"Bearer {SESSION_COOKIE}"
    return anonymous_client
