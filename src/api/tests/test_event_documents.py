import io
from typing import Any

from httpx import AsyncClient
from pypdf import PdfReader

from tests.conftest import OTHER_SESSION_COOKIE

SENDER = {
    "sender_name": "Fundacja Przykładowa",
    "street": "ul. Długa 5",
    "postal_code": "00-001",
    "city": "Warszawa",
    "country": "PL",
}


async def _event(client: AsyncClient, **fields: Any) -> int:
    response = await client.post(
        "/events", json={"name": "Gala", "starts_at": "2026-10-15T18:00", **fields}
    )
    event_id: int = response.json()["id"]
    return event_id


async def _guests_on_list(client: AsyncClient, event_id: int, *names: str) -> list[int]:
    ids = []
    for name in names:
        response = await client.post(
            "/guests", json={"full_name": name, "salutation": f"Szanowni {name}", "city": "Kraków"}
        )
        ids.append(response.json()["id"])
    await client.post(f"/events/{event_id}/guests", json={"guest_ids": ids})
    return ids


async def _ready_event(client: AsyncClient, *names: str) -> int:
    """An event with verified guests and a complete sender: nothing to confirm."""
    await client.put("/me", json=SENDER)
    event_id = await _event(client)
    guest_ids = await _guests_on_list(client, event_id, *names)
    await client.post("/guests/verification/manual", json={"guest_ids": guest_ids})
    return event_id


async def _generate(client: AsyncClient, event_id: int, kind: str, **body: Any) -> Any:
    return await client.post(f"/events/{event_id}/documents/{kind}", json=body)


def _pages(pdf: bytes) -> list[str]:
    return [page.extract_text() for page in PdfReader(io.BytesIO(pdf)).pages]


async def test_invitations_for_every_guest_in_list_order(client: AsyncClient) -> None:
    event_id = await _ready_event(client, "Zofia Wiśniewska", "Anna Nowak")

    response = await _generate(client, event_id, "invitation")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    pages = _pages(response.content)
    assert len(pages) == 2
    assert "Anna Nowak" in pages[0]
    assert "Zofia Wiśniewska" in pages[1]
    assert all("Gala" in page and "Fundacja Przykładowa" in page for page in pages)


async def test_envelopes_match_the_invitation_order(client: AsyncClient) -> None:
    event_id = await _ready_event(client, "Zofia Wiśniewska", "Anna Nowak")

    response = await _generate(client, event_id, "envelope")

    pages = _pages(response.content)
    assert ["Anna Nowak" in pages[0], "Zofia Wiśniewska" in pages[1]] == [True, True]
    assert all("Kraków" in page and "ul. Długa 5" in page for page in pages)


async def test_invitations_mark_guests_generated(client: AsyncClient) -> None:
    event_id = await _ready_event(client, "Anna Nowak", "Jan Kowalski")
    items = (await client.get(f"/events/{event_id}/guests")).json()["items"]
    jan = next(
        item["guest"]["id"] for item in items if item["guest"]["full_name"] == "Jan Kowalski"
    )
    await client.patch(f"/events/{event_id}/guests/{jan}", json={"status": "accepted"})

    await _generate(client, event_id, "envelope")
    after_envelopes = (await client.get(f"/events/{event_id}/guests")).json()["items"]
    await _generate(client, event_id, "invitation")
    after_invitations = (await client.get(f"/events/{event_id}/guests")).json()["items"]

    assert all(item["generated_at"] is None for item in after_envelopes)
    assert {item["guest"]["full_name"]: item["status"] for item in after_invitations} == {
        "Anna Nowak": "generated",
        "Jan Kowalski": "accepted",
    }
    assert all(item["generated_at"] for item in after_invitations)


async def test_unverified_guests_and_missing_sender_need_confirmation(
    client: AsyncClient,
) -> None:
    event_id = await _event(client)
    await _guests_on_list(client, event_id, "Anna Nowak", "Jan Kowalski")

    asked = await _generate(client, event_id, "invitation")
    confirmed = await _generate(client, event_id, "invitation", confirmed=True)

    assert asked.status_code == 409
    assert asked.json()["detail"] == {
        "code": "needs_confirmation",
        "unverified": 2,
        "sender_incomplete": True,
    }
    assert confirmed.status_code == 200
    assert len(_pages(confirmed.content)) == 2


async def test_no_guests_or_no_template_is_a_conflict(client: AsyncClient) -> None:
    empty = await _event(client)
    no_template = await _event(client, envelope_template_id=None)
    await _guests_on_list(client, no_template, "Anna Nowak")

    without_guests = await _generate(client, empty, "invitation", confirmed=True)
    without_template = await _generate(client, no_template, "envelope", confirmed=True)

    assert without_guests.status_code == 409
    assert without_guests.json()["detail"]["code"] == "no_guests"
    assert without_template.status_code == 409
    assert without_template.json()["detail"]["code"] == "no_template"


async def test_deleted_guests_are_left_out(client: AsyncClient) -> None:
    event_id = await _ready_event(client, "Anna Nowak", "Jan Kowalski")
    items = (await client.get(f"/events/{event_id}/guests")).json()["items"]
    jan = next(
        item["guest"]["id"] for item in items if item["guest"]["full_name"] == "Jan Kowalski"
    )
    await client.delete(f"/guests/{jan}")

    response = await _generate(client, event_id, "invitation")

    pages = _pages(response.content)
    assert len(pages) == 1
    assert "Anna Nowak" in pages[0]


async def test_documents_are_private_to_the_event_owner(client: AsyncClient) -> None:
    event_id = await _ready_event(client, "Anna Nowak")
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"

    response = await _generate(client, event_id, "invitation", confirmed=True)

    assert response.status_code == 404
