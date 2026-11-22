from typing import Any

from httpx import AsyncClient

from tests.conftest import OTHER_SESSION_COOKIE


async def _event(client: AsyncClient, name: str = "Gala") -> int:
    response = await client.post("/events", json={"name": name, "starts_at": "2026-10-15T18:00"})
    event_id: int = response.json()["id"]
    return event_id


async def _guest(client: AsyncClient, **fields: Any) -> int:
    response = await client.post("/guests", json=fields)
    guest_id: int = response.json()["id"]
    return guest_id


async def _names_on_list(client: AsyncClient, event_id: int) -> list[str]:
    response = await client.get(f"/events/{event_id}/guests")
    assert response.status_code == 200
    return [event_guest["guest"]["full_name"] for event_guest in response.json()["items"]]


async def test_add_guests_to_an_event(client: AsyncClient) -> None:
    event_id = await _event(client)
    piotr = await _guest(client, full_name="Piotr Lis")
    anna = await _guest(client, full_name="Anna Nowak")

    response = await client.post(f"/events/{event_id}/guests", json={"guest_ids": [piotr, anna]})

    assert response.status_code == 200
    assert response.json() == {"added": 2, "already_present": 0, "not_found": []}
    event_guests = (await client.get(f"/events/{event_id}/guests")).json()["items"]
    assert [event_guest["guest"]["full_name"] for event_guest in event_guests] == [
        "Anna Nowak",
        "Piotr Lis",
    ]
    assert {event_guest["status"] for event_guest in event_guests} == {"added"}
    assert all(event_guest["added_at"] for event_guest in event_guests)
    assert event_guests[0]["generated_at"] is None


async def test_list_is_sorted_by_recipient_including_institutions(client: AsyncClient) -> None:
    event_id = await _event(client)
    ids = [
        await _guest(client, full_name="Zofia Wiśniewska"),
        await _guest(client, institution="Biblioteka Narodowa"),
        await _guest(client, full_name="Marek Kowal"),
    ]
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": ids})

    event_guests = (await client.get(f"/events/{event_id}/guests")).json()["items"]

    recipients = [
        event_guest["guest"]["full_name"] or event_guest["guest"]["institution"]
        for event_guest in event_guests
    ]
    assert recipients == ["Biblioteka Narodowa", "Marek Kowal", "Zofia Wiśniewska"]


async def test_adding_again_reports_present_and_unknown_guests(client: AsyncClient) -> None:
    event_id = await _event(client)
    jan = await _guest(client, full_name="Jan Kowalski")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": [jan]})
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"
    foreign = await _guest(client, full_name="Obcy Gość")
    client.headers["Authorization"] = "Bearer session-cookie"
    deleted = await _guest(client, full_name="Usunięty Gość")
    await client.delete(f"/guests/{deleted}")

    response = await client.post(
        f"/events/{event_id}/guests", json={"guest_ids": [jan, foreign, deleted, 999]}
    )

    assert response.json() == {
        "added": 0,
        "already_present": 1,
        "not_found": sorted([foreign, deleted, 999]),
    }
    assert await _names_on_list(client, event_id) == ["Jan Kowalski"]


async def test_rejects_an_empty_or_too_long_request(client: AsyncClient) -> None:
    event_id = await _event(client)

    empty = await client.post(f"/events/{event_id}/guests", json={"guest_ids": []})
    too_long = await client.post(
        f"/events/{event_id}/guests", json={"guest_ids": list(range(1, 1002))}
    )

    assert empty.status_code == 422
    assert too_long.status_code == 422


async def test_change_invitation_status(client: AsyncClient) -> None:
    event_id = await _event(client)
    jan = await _guest(client, full_name="Jan Kowalski")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": [jan]})

    response = await client.patch(f"/events/{event_id}/guests/{jan}", json={"status": "accepted"})
    invalid = await client.patch(f"/events/{event_id}/guests/{jan}", json={"status": "maybe"})

    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    assert response.json()["guest"]["id"] == jan
    assert invalid.status_code == 422
    assert (await client.get(f"/events/{event_id}/guests")).json()["items"][0][
        "status"
    ] == "accepted"


async def test_remove_guest_from_the_list_keeps_the_guest(client: AsyncClient) -> None:
    event_id = await _event(client)
    jan = await _guest(client, full_name="Jan Kowalski")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": [jan]})

    response = await client.delete(f"/events/{event_id}/guests/{jan}")

    assert response.status_code == 204
    assert await _names_on_list(client, event_id) == []
    assert (await client.get(f"/guests/{jan}")).status_code == 200
    assert (await client.delete(f"/events/{event_id}/guests/{jan}")).status_code == 404
    patched = await client.patch(f"/events/{event_id}/guests/{jan}", json={"status": "sent"})
    assert patched.status_code == 404


async def test_lists_are_separate_per_event(client: AsyncClient) -> None:
    gala = await _event(client, "Gala")
    concert = await _event(client, "Koncert")
    jan = await _guest(client, full_name="Jan Kowalski")
    await client.post(f"/events/{gala}/guests", json={"guest_ids": [jan]})

    assert await _names_on_list(client, concert) == []
    assert (await client.delete(f"/events/{concert}/guests/{jan}")).status_code == 404


async def test_deleted_guest_leaves_lists_and_returns_when_restored(client: AsyncClient) -> None:
    event_id = await _event(client)
    jan = await _guest(client, full_name="Jan Kowalski")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": [jan]})
    await client.patch(f"/events/{event_id}/guests/{jan}", json={"status": "sent"})

    await client.delete(f"/guests/{jan}")
    hidden = await _names_on_list(client, event_id)
    status_change = await client.patch(
        f"/events/{event_id}/guests/{jan}", json={"status": "accepted"}
    )
    await client.post(f"/guests/{jan}/restore")

    assert hidden == []
    assert status_change.status_code == 404
    event_guests = (await client.get(f"/events/{event_id}/guests")).json()["items"]
    assert [(item["guest"]["id"], item["status"]) for item in event_guests] == [(jan, "sent")]


async def test_permanent_deletes_clear_the_list(client: AsyncClient) -> None:
    event_id = await _event(client)
    jan = await _guest(client, full_name="Jan Kowalski")
    anna = await _guest(client, full_name="Anna Nowak")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": [jan, anna]})

    await client.delete(f"/guests/{jan}", params={"permanent": "true"})
    assert await _names_on_list(client, event_id) == ["Anna Nowak"]

    await client.delete(f"/events/{event_id}", params={"permanent": "true"})
    assert (await client.get(f"/guests/{anna}")).status_code == 200


async def test_deleted_event_has_no_list(client: AsyncClient) -> None:
    event_id = await _event(client)
    jan = await _guest(client, full_name="Jan Kowalski")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": [jan]})

    await client.delete(f"/events/{event_id}")

    assert (await client.get(f"/events/{event_id}/guests")).status_code == 404
    added = await client.post(f"/events/{event_id}/guests", json={"guest_ids": [jan]})
    assert added.status_code == 404
    await client.post(f"/events/{event_id}/restore")
    assert await _names_on_list(client, event_id) == ["Jan Kowalski"]


async def test_lists_are_private_to_the_event_owner(client: AsyncClient) -> None:
    event_id = await _event(client)
    jan = await _guest(client, full_name="Jan Kowalski")
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": [jan]})
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"
    own_guest = await _guest(client, full_name="Obcy Gość")

    assert (await client.get(f"/events/{event_id}/guests")).status_code == 404
    added = await client.post(f"/events/{event_id}/guests", json={"guest_ids": [own_guest]})
    assert added.status_code == 404
    patched = await client.patch(f"/events/{event_id}/guests/{jan}", json={"status": "sent"})
    assert patched.status_code == 404
    assert (await client.delete(f"/events/{event_id}/guests/{jan}")).status_code == 404

    client.headers["Authorization"] = "Bearer session-cookie"
    assert await _names_on_list(client, event_id) == ["Jan Kowalski"]


async def test_event_list_counts_active_guests(client: AsyncClient) -> None:
    gala = await _event(client, "Gala")
    empty = await _event(client, "Pusta")
    anna, jan = (
        await _guest(client, full_name="Anna Nowak"),
        await _guest(client, full_name="Jan Nowak"),
    )
    await client.post(f"/events/{gala}/guests", json={"guest_ids": [anna, jan]})
    await client.delete(f"/guests/{jan}")

    counts = {
        event["id"]: event["guest_count"] for event in (await client.get("/events")).json()["items"]
    }

    assert counts == {gala: 1, empty: 0}
