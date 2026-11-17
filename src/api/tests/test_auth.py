from datetime import timedelta

import pytest
from httpx import AsyncClient
from pydantic import ValidationError

from app.settings import Settings, get_settings
from tests.conftest import SESSION_COOKIE, USER, VALID_ID_TOKEN, FakeIdentity


async def test_exchanges_id_token_for_session_cookie(
    anonymous_client: AsyncClient, identity: FakeIdentity
) -> None:
    response = await anonymous_client.post("/auth/session", json={"id_token": VALID_ID_TOKEN})

    assert response.status_code == 200
    assert response.json() == {"session_cookie": SESSION_COOKIE, "expires_in": 7 * 24 * 3600}
    assert identity.session_lifetimes == [timedelta(days=7)]


async def test_rejects_invalid_id_token(anonymous_client: AsyncClient) -> None:
    response = await anonymous_client.post("/auth/session", json={"id_token": "forged"})

    assert response.status_code == 401


async def test_me_returns_signed_in_user(client: AsyncClient) -> None:
    response = await client.get("/auth/me")

    assert response.status_code == 200
    assert response.json() == USER.model_dump()


@pytest.mark.parametrize("path", ["/auth/me", "/guests", "/guests/1"])
async def test_requires_session(anonymous_client: AsyncClient, path: str) -> None:
    response = await anonymous_client.get(path)

    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == "Bearer"


async def test_rejects_invalid_session(anonymous_client: AsyncClient) -> None:
    response = await anonymous_client.get("/guests", headers={"Authorization": "Bearer forged"})

    assert response.status_code == 401


async def test_logout_revokes_sessions(client: AsyncClient, identity: FakeIdentity) -> None:
    response = await client.post("/auth/logout")

    assert response.status_code == 204
    assert identity.revoked == [USER.uid]
    assert (await client.get("/auth/me")).status_code == 401


async def test_dev_auth_user_signs_in_without_google(
    anonymous_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("DEV_AUTH_USER", "dev@localhost")
    get_settings.cache_clear()
    try:
        response = await anonymous_client.get("/auth/me")
    finally:
        monkeypatch.delenv("DEV_AUTH_USER")
        get_settings.cache_clear()

    assert response.status_code == 200
    assert response.json() == {"uid": "dev:dev@localhost", "email": "dev@localhost"}


def test_dev_auth_user_is_rejected_on_cloud_run(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("K_SERVICE", "api")

    with pytest.raises(ValidationError, match="DEV_AUTH_USER must not be set on Cloud Run"):
        Settings(database_url="postgresql+psycopg://a:b@localhost/c", dev_auth_user="x@y")
