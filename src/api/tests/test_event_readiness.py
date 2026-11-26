from typing import Any

from httpx import AsyncClient
from sqlalchemy import update

from app.main import app
from app.models import Guest
from tests.conftest import ADDRESS, OTHER_SESSION_COOKIE

SENDER = {
    "sender_name": "Fundacja Przykładowa",
    "street": "ul. Długa 5",
    "postal_code": "00-001",
    "city": "Warszawa",
    "country": "PL",
}


async def _event(client: AsyncClient) -> dict[str, Any]:
    response = await client.post("/events", json={"name": "Gala", "starts_at": "2026-10-15T18:00"})
    event: dict[str, Any] = response.json()
    return event


async def _readiness(client: AsyncClient, event_id: int) -> dict[str, Any]:
    response = await client.get(f"/events/{event_id}/readiness")
    assert response.status_code == 200
    readiness: dict[str, Any] = response.json()
    return readiness


async def test_a_new_event_lacks_guests_and_a_sender(client: AsyncClient) -> None:
    event = await _event(client)

    readiness = await _readiness(client, event["id"])

    assert readiness == {
        "guests": 0,
        "unverified": 0,
        "without_address": 0,
        "invitation_template": True,
        "envelope_template": True,
        "sender_complete": False,
    }


async def test_counts_unverified_guests_and_guests_without_an_address(
    client: AsyncClient,
) -> None:
    event = await _event(client)
    ids = [
        (await client.post("/guests", json={**ADDRESS, "full_name": name})).json()["id"]
        for name in ("Anna Nowak", "Jan Kowalski", "Ewa Lis")
    ]
    await client.post(f"/events/{event['id']}/guests", json={"guest_ids": ids})
    await client.post(f"/guests/{ids[0]}/verification/manual")
    async with app.state.sessionmaker() as session, session.begin():
        # A guest saved before the address became required.
        await session.execute(update(Guest).where(Guest.id == ids[1]).values(street=None))
    await client.delete(f"/guests/{ids[2]}")

    readiness = await _readiness(client, event["id"])

    assert (readiness["guests"], readiness["unverified"], readiness["without_address"]) == (2, 1, 1)


async def test_templates_and_sender_follow_what_is_saved(client: AsyncClient) -> None:
    event = await _event(client)
    await client.put("/me", json=SENDER)
    body = {"name": "Gala", "starts_at": "2026-10-15T18:00"}
    await client.put(
        f"/events/{event['id']}",
        json={**body, "invitation_template_id": event["invitation_template_id"]},
    )

    readiness = await _readiness(client, event["id"])

    assert (readiness["invitation_template"], readiness["envelope_template"]) == (True, False)
    assert readiness["sender_complete"] is True


async def test_readiness_is_private_to_the_owner(client: AsyncClient) -> None:
    event = await _event(client)
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"

    assert (await client.get(f"/events/{event['id']}/readiness")).status_code == 404
