import importlib

import pytest
from httpx import AsyncClient

import app.main


async def test_hello(client: AsyncClient) -> None:
    response = await client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "hello"}


@pytest.mark.parametrize(
    ("k_service", "urls"),
    [
        (None, ("/docs", "/redoc", "/openapi.json")),
        ("api", (None, None, None)),
    ],
)
def test_api_docs_only_outside_cloud_run(
    monkeypatch: pytest.MonkeyPatch, k_service: str | None, urls: tuple[str | None, ...]
) -> None:
    if k_service is None:
        monkeypatch.delenv("K_SERVICE", raising=False)
    else:
        monkeypatch.setenv("K_SERVICE", k_service)
    try:
        reloaded = importlib.reload(app.main).app
        assert (reloaded.docs_url, reloaded.redoc_url, reloaded.openapi_url) == urls
    finally:
        monkeypatch.undo()
        importlib.reload(app.main)
