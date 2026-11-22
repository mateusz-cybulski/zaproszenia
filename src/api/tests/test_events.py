from datetime import UTC, datetime
from typing import Any

from httpx import AsyncClient

from app.models import Event, Profile
from app.services.placeholders import event_preview_values
from tests.conftest import OTHER_SESSION_COOKIE

GALA = {
    "name": "Gala Jubileuszowa",
    "starts_at": "2026-10-15T18:00:00",
    "venue_name": "Zamek Królewski",
    "street": "pl. Zamkowy 4",
    "postal_code": "00-277",
    "city": "Warszawa",
    "invitation_text": "Mamy zaszczyt zaprosić na uroczystą galę.",
}


async def _system_template_id(client: AsyncClient, kind: str) -> int:
    templates = (await client.get("/templates")).json()
    template_id: int = next(
        template["id"]
        for template in templates
        if template["is_system"] and template["kind"] == kind
    )
    return template_id


async def _create(client: AsyncClient, **overrides: Any) -> dict[str, Any]:
    response = await client.post("/events", json={**GALA, **overrides})
    assert response.status_code == 201, response.text
    event: dict[str, Any] = response.json()
    return event


async def test_create_and_read_event(client: AsyncClient) -> None:
    event = await _create(client, name="  Gala Jubileuszowa ")

    assert event["name"] == "Gala Jubileuszowa"
    assert event["timezone"] == "Europe/Warsaw"
    assert event["starts_at"] == "2026-10-15T16:00:00Z"
    assert event["venue_name"] == "Zamek Królewski"
    assert event["country"] == "PL"
    assert event["deleted_at"] is None
    assert (await client.get(f"/events/{event['id']}")).json() == event


async def test_start_with_an_offset_is_kept_as_given(client: AsyncClient) -> None:
    event = await _create(client, starts_at="2026-10-15T18:00:00+01:00", timezone="Europe/London")

    assert event["starts_at"] == "2026-10-15T17:00:00Z"
    assert event["timezone"] == "Europe/London"


async def test_new_event_gets_the_system_templates(client: AsyncClient) -> None:
    event = await _create(client)

    assert event["invitation_template_id"] == await _system_template_id(client, "invitation")
    assert event["envelope_template_id"] == await _system_template_id(client, "envelope")


async def test_templates_can_be_left_empty(client: AsyncClient) -> None:
    event = await _create(client, invitation_template_id=None, envelope_template_id=None)

    assert (event["invitation_template_id"], event["envelope_template_id"]) == (None, None)


async def test_rejects_invalid_fields(client: AsyncClient) -> None:
    for overrides in (
        {"name": "  "},
        {"name": "x" * 301},
        {"starts_at": "jutro"},
        {"timezone": "Mars/Olympus"},
        {"invitation_text": "x" * 5001},
        {"country": "Polska"},
    ):
        response = await client.post("/events", json={**GALA, **overrides})
        assert response.status_code == 422, overrides

    response = await client.post("/events", json={**GALA, "timezone": "Mars/Olympus"})
    assert "Nieznana strefa czasowa." in response.text


async def test_templates_must_be_of_the_right_kind_and_visible(client: AsyncClient) -> None:
    envelope = await _system_template_id(client, "envelope")
    copy = (await client.post(f"/templates/{envelope}/copy")).json()

    wrong_kind = await client.post("/events", json={**GALA, "invitation_template_id": envelope})
    missing = await client.post("/events", json={**GALA, "envelope_template_id": 999})
    other = {"Authorization": f"Bearer {OTHER_SESSION_COOKIE}"}
    foreign = await client.post(
        "/events", json={**GALA, "envelope_template_id": copy["id"]}, headers=other
    )
    own = await client.post("/events", json={**GALA, "envelope_template_id": copy["id"]})

    assert wrong_kind.status_code == 422
    assert wrong_kind.json()["detail"][0]["loc"] == ["body", "invitation_template_id"]
    assert missing.status_code == 422
    assert foreign.status_code == 422
    assert own.status_code == 201


async def test_deleting_a_template_clears_it_from_events(client: AsyncClient) -> None:
    invitation = await _system_template_id(client, "invitation")
    copy = (await client.post(f"/templates/{invitation}/copy")).json()
    event = await _create(client, invitation_template_id=copy["id"])

    assert (await client.delete(f"/templates/{copy['id']}")).status_code == 204

    assert (await client.get(f"/events/{event['id']}")).json()["invitation_template_id"] is None


async def test_list_events_latest_first(client: AsyncClient) -> None:
    await _create(client, name="Wiosna", starts_at="2026-04-01T12:00:00")
    await _create(client, name="Jesień", starts_at="2026-10-01T12:00:00")

    events = (await client.get("/events")).json()["items"]

    assert [event["name"] for event in events] == ["Jesień", "Wiosna"]


async def test_replace_event(client: AsyncClient) -> None:
    event = await _create(client)

    response = await client.put(
        f"/events/{event['id']}",
        json={**GALA, "name": "Gala", "venue_name": "", "invitation_template_id": None},
    )

    assert response.status_code == 200
    replaced = response.json()
    assert replaced["name"] == "Gala"
    assert replaced["venue_name"] is None
    assert replaced["invitation_template_id"] is None
    assert replaced["envelope_template_id"] is None
    assert replaced["updated_at"] > event["updated_at"]
    assert (await client.get(f"/events/{event['id']}")).json() == replaced


async def test_replace_checks_templates(client: AsyncClient) -> None:
    event = await _create(client)
    envelope = await _system_template_id(client, "envelope")

    response = await client.put(
        f"/events/{event['id']}", json={**GALA, "invitation_template_id": envelope}
    )

    assert response.status_code == 422
    assert (await client.get(f"/events/{event['id']}")).json() == event


async def test_events_are_private_to_their_owner(client: AsyncClient) -> None:
    event = await _create(client)
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"

    assert (await client.get("/events")).json()["items"] == []
    assert (await client.get(f"/events/{event['id']}")).status_code == 404
    assert (await client.put(f"/events/{event['id']}", json=GALA)).status_code == 404
    assert (await client.delete(f"/events/{event['id']}")).status_code == 404
    permanent = await client.delete(f"/events/{event['id']}", params={"permanent": "true"})
    assert permanent.status_code == 404
    assert (await client.post(f"/events/{event['id']}/restore")).status_code == 404


async def test_soft_deleted_event_leaves_the_list_and_can_be_restored(client: AsyncClient) -> None:
    gala = await _create(client)
    other = await _create(client, name="Koncert")

    assert (await client.delete(f"/events/{gala['id']}")).status_code == 204

    assert [event["id"] for event in (await client.get("/events")).json()["items"]] == [other["id"]]
    deleted = (await client.get("/events", params={"deleted": "true"})).json()["items"]
    assert [event["id"] for event in deleted] == [gala["id"]]
    assert deleted[0]["deleted_at"] is not None
    assert (await client.get(f"/events/{gala['id']}")).status_code == 404
    assert (await client.put(f"/events/{gala['id']}", json=GALA)).status_code == 404

    restored = await client.post(f"/events/{gala['id']}/restore")
    assert restored.status_code == 200
    assert restored.json()["deleted_at"] is None
    assert len((await client.get("/events")).json()["items"]) == 2
    assert (await client.post(f"/events/{gala['id']}/restore")).status_code == 404


async def test_permanent_delete_removes_active_and_deleted_events(client: AsyncClient) -> None:
    gala = await _create(client)
    concert = await _create(client, name="Koncert")
    await client.delete(f"/events/{concert['id']}")

    for event in (gala, concert):
        response = await client.delete(f"/events/{event['id']}", params={"permanent": "true"})
        assert response.status_code == 204

    assert (await client.get("/events")).json()["items"] == []
    assert (await client.get("/events", params={"deleted": "true"})).json()["items"] == []


async def test_events_require_sign_in(anonymous_client: AsyncClient) -> None:
    assert (await anonymous_client.get("/events")).status_code == 401


async def test_replace_event_saves_templates_with_the_details(client: AsyncClient) -> None:
    event = await _create(client)
    envelope = await _system_template_id(client, "envelope")
    body = {**GALA, "name": "Gala"}

    response = await client.put(
        f"/events/{event['id']}",
        json={**body, "invitation_template_id": None, "envelope_template_id": envelope},
    )
    wrong_kind = await client.put(
        f"/events/{event['id']}", json={**body, "invitation_template_id": envelope}
    )

    assert response.status_code == 200
    saved = response.json()
    assert (saved["invitation_template_id"], saved["envelope_template_id"]) == (None, envelope)
    assert saved["name"] == "Gala"
    assert wrong_kind.status_code == 422
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"
    foreign = await client.put(f"/events/{event['id']}", json=body)
    assert foreign.status_code == 404


async def test_preview_renders_a_template_page_for_the_event(client: AsyncClient) -> None:
    event = await _create(client)
    invitation = await _system_template_id(client, "invitation")

    response = await client.get(
        f"/events/{event['id']}/preview.png", params={"template_id": invitation}
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content.startswith(b"\x89PNG")


async def test_preview_follows_event_and_template_access(client: AsyncClient) -> None:
    event = await _create(client)
    invitation = await _system_template_id(client, "invitation")
    path = f"/events/{event['id']}/preview.png"

    missing_page = await client.get(path, params={"template_id": invitation, "page": 3})
    missing_template = await client.get(path, params={"template_id": 999})
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"
    foreign_event = await client.get(path, params={"template_id": invitation})

    assert missing_page.status_code == 404
    assert missing_template.status_code == 404
    assert foreign_event.status_code == 404


def test_preview_values_use_the_event_its_zone_and_the_sender() -> None:
    event = Event(
        name="Koncert",
        starts_at=datetime(2026, 12, 12, 18, 30, tzinfo=UTC),
        timezone="Europe/Warsaw",
        venue_name="Filharmonia",
        street="ul. Jasna 5",
        postal_code="00-013",
        city="Warszawa",
        country="PL",
        invitation_text="Zapraszamy.",
    )
    profile = Profile(sender_name="Fundacja", street="ul. Długa 5", city="Kraków", country="PL")

    values = event_preview_values(event, profile)

    assert values["event_name"] == "Koncert"
    assert values["event_time"] == "19:30"
    assert values["event_weekday"] == "sobota"
    assert values["venue"] == "Filharmonia"
    assert values["event_address"] == "ul. Jasna 5\n00-013 Warszawa"
    assert values["invitation_text"] == "Zapraszamy."
    assert values["sender_name"] == "Fundacja"
    assert values["sender_address"] == "ul. Długa 5\nKraków"
    assert values["recipient"]


def test_preview_values_without_a_sender_leave_it_empty() -> None:
    event = Event(
        name="Koncert",
        starts_at=datetime(2026, 12, 12, 18, 30, tzinfo=UTC),
        timezone="Europe/Warsaw",
        country="PL",
    )

    values = event_preview_values(event, None)

    assert (values["sender_name"], values["sender_address"]) == ("", "")
    assert values["venue"] == ""
