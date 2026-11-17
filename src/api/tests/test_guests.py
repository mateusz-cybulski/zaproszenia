from httpx import AsyncClient

from tests.conftest import OTHER_SESSION_COOKIE


async def test_create_and_read_guest(client: AsyncClient) -> None:
    created = await client.post(
        "/guests", json={"name": "  Jan Kowalski ", "email": "jan@example.com"}
    )

    assert created.status_code == 201
    guest = created.json()
    assert guest["name"] == "Jan Kowalski"
    assert guest["email"] == "jan@example.com"
    assert guest["created_at"]

    fetched = await client.get(f"/guests/{guest['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == guest


async def test_list_guests_in_creation_order(client: AsyncClient) -> None:
    for name in ["Anna", "Piotr"]:
        await client.post("/guests", json={"name": name})

    response = await client.get("/guests")

    assert response.status_code == 200
    assert [guest["name"] for guest in response.json()] == ["Anna", "Piotr"]


async def test_missing_guest_returns_404(client: AsyncClient) -> None:
    response = await client.get("/guests/999")

    assert response.status_code == 404


async def test_replace_guest(client: AsyncClient) -> None:
    created = (
        await client.post("/guests", json={"name": "Jan", "email": "jan@example.com"})
    ).json()

    response = await client.put(f"/guests/{created['id']}", json={"name": "Jan Nowak"})

    assert response.status_code == 200
    assert response.json() == {**created, "name": "Jan Nowak", "email": None}
    assert (await client.get(f"/guests/{created['id']}")).json() == response.json()


async def test_replace_missing_guest_returns_404(client: AsyncClient) -> None:
    response = await client.put("/guests/999", json={"name": "Jan"})

    assert response.status_code == 404


async def test_rejects_invalid_guest(client: AsyncClient) -> None:
    response = await client.post("/guests", json={"name": "", "email": "not-an-email"})

    assert response.status_code == 422


async def test_guests_are_private_to_their_owner(client: AsyncClient) -> None:
    created = (await client.post("/guests", json={"name": "Jan"})).json()
    other = {"Authorization": f"Bearer {OTHER_SESSION_COOKIE}"}

    assert (await client.get("/guests", headers=other)).json() == []
    assert (await client.get(f"/guests/{created['id']}", headers=other)).status_code == 404
    replaced = await client.put(f"/guests/{created['id']}", json={"name": "X"}, headers=other)
    assert replaced.status_code == 404
    assert (await client.get(f"/guests/{created['id']}")).json() == created
