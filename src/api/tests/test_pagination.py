from typing import Any

from httpx import AsyncClient

from tests.conftest import OTHER_SESSION_COOKIE


async def _guests(client: AsyncClient, *names: str) -> list[int]:
    ids = []
    for name in names:
        response = await client.post("/guests", json={"full_name": name})
        ids.append(response.json()["id"])
    return ids


async def _event(client: AsyncClient, name: str = "Gala") -> int:
    response = await client.post("/events", json={"name": name, "starts_at": "2026-10-15T18:00"})
    event_id: int = response.json()["id"]
    return event_id


async def _page(client: AsyncClient, path: str, **params: Any) -> dict[str, Any]:
    response = await client.get(path, params=params)
    assert response.status_code == 200, response.text
    page: dict[str, Any] = response.json()
    return page


async def test_guest_list_is_paged(client: AsyncClient) -> None:
    ids = await _guests(client, "A", "B", "C", "D", "E")

    first = await _page(client, "/guests", page_size=2)
    last = await _page(client, "/guests", page_size=2, page=3)
    beyond = await _page(client, "/guests", page_size=2, page=4)

    assert [guest["id"] for guest in first["items"]] == ids[:2]
    assert (first["total"], first["page"], first["page_size"]) == (5, 1, 2)
    assert [guest["id"] for guest in last["items"]] == ids[4:]
    assert beyond["items"] == []
    assert beyond["total"] == 5


async def test_default_page_size_is_100(client: AsyncClient) -> None:
    page = await _page(client, "/guests")

    assert (page["page"], page["page_size"]) == (1, 100)


async def test_page_parameters_are_validated(client: AsyncClient) -> None:
    for params in ({"page": 0}, {"page_size": 0}, {"page_size": 501}, {"page": "x"}):
        response = await client.get("/guests", params=params)
        assert response.status_code == 422, params


async def test_search_counts_only_matches(client: AsyncClient) -> None:
    await _guests(client, "Anna Kowalska", "Jan Kowalski", "Piotr Lis")

    page = await _page(client, "/guests", q="kowal", page_size=1)

    assert page["total"] == 2
    assert len(page["items"]) == 1


async def test_event_list_is_paged(client: AsyncClient) -> None:
    for name in ("Wiosna", "Lato", "Jesień"):
        await _event(client, name)

    page = await _page(client, "/events", page_size=2, page=2)

    assert page["total"] == 3
    assert len(page["items"]) == 1


async def test_event_guest_list_is_paged(client: AsyncClient) -> None:
    event_id = await _event(client)
    ids = await _guests(client, "Celina", "Adam", "Bogdan")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": ids})

    page = await _page(client, f"/events/{event_id}/guests", page_size=2)

    assert page["total"] == 3
    assert [item["guest"]["full_name"] for item in page["items"]] == ["Adam", "Bogdan"]


async def test_guests_not_on_an_event(client: AsyncClient) -> None:
    event_id = await _event(client)
    anna, jan, piotr = await _guests(client, "Anna Kowalska", "Jan Kowalski", "Piotr Lis")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": [anna]})

    candidates = await _page(client, "/guests", not_on_event=event_id)
    searched = await _page(client, "/guests", not_on_event=event_id, q="kowal")

    assert [guest["id"] for guest in candidates["items"]] == [jan, piotr]
    assert [guest["id"] for guest in searched["items"]] == [jan]


async def test_not_on_event_needs_the_users_own_event(client: AsyncClient) -> None:
    event_id = await _event(client)
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"

    response = await client.get("/guests", params={"not_on_event": event_id})

    assert response.status_code == 404


async def test_add_all_matching_guests(client: AsyncClient) -> None:
    event_id = await _event(client)
    anna, jan, _piotr = await _guests(client, "Anna Kowalska", "Jan Kowalski", "Piotr Lis")
    deleted = (await _guests(client, "Ewa Kowalczyk"))[0]
    await client.delete(f"/guests/{deleted}")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": [anna]})
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"
    await _guests(client, "Obca Kowalska")
    client.headers["Authorization"] = "Bearer session-cookie"

    response = await client.post(f"/events/{event_id}/guests/matching", json={"q": "kowal"})

    assert response.status_code == 200
    assert response.json() == {"added": 1, "already_present": 0, "not_found": []}
    on_list = await _page(client, f"/events/{event_id}/guests")
    assert sorted(item["guest"]["id"] for item in on_list["items"]) == sorted([anna, jan])


async def test_add_all_without_a_search_adds_everyone_left(client: AsyncClient) -> None:
    event_id = await _event(client)
    await _guests(client, "A", "B", "C")

    first = await client.post(f"/events/{event_id}/guests/matching", json={})
    again = await client.post(f"/events/{event_id}/guests/matching", json={"q": None})

    assert first.json()["added"] == 3
    assert again.json()["added"] == 0
    assert (await _page(client, f"/events/{event_id}/guests"))["total"] == 3


async def test_add_all_matching_needs_the_users_own_event(client: AsyncClient) -> None:
    event_id = await _event(client)
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"

    response = await client.post(f"/events/{event_id}/guests/matching", json={})

    assert response.status_code == 404
