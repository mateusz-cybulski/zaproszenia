from typing import Any

from httpx import AsyncClient

from app.main import app
from app.services.placeholders import to_storage
from app.services.templates import ensure_system_templates
from tests.conftest import OTHER_SESSION_COOKIE


def _field(**overrides: Any) -> dict[str, Any]:
    return {
        "id": "greeting",
        "page": 0,
        "x_mm": 10,
        "y_mm": 20,
        "width_mm": 100,
        "content": "{salutation},",
        **overrides,
    }


async def _system_template(client: AsyncClient, kind: str) -> dict[str, Any]:
    templates = (await client.get("/templates", params={"kind": kind})).json()
    return next(template for template in templates if template["is_system"])


async def _own_copy(client: AsyncClient, kind: str = "invitation") -> dict[str, Any]:
    system = await _system_template(client, kind)
    response = await client.post(f"/templates/{system['id']}/copy")
    assert response.status_code == 201
    copy: dict[str, Any] = response.json()
    return copy


async def test_system_templates_have_a_default_layout(client: AsyncClient) -> None:
    templates = (await client.get("/templates")).json()

    system = {template["kind"]: template for template in templates if template["is_system"]}
    assert set(system) == {"invitation", "envelope"}
    assert system["envelope"]["pages"] == [{"width_mm": 220.0, "height_mm": 110.0}]
    envelope_contents = [field["content"] for field in system["envelope"]["fields"]]
    assert "{recipient_block}" in envelope_contents
    assert system["invitation"]["fields"][0]["font"] == "serif-italic"


async def test_system_templates_are_created_once(client: AsyncClient) -> None:
    async with app.state.sessionmaker() as session, session.begin():
        await ensure_system_templates(session)

    templates = (await client.get("/templates")).json()
    assert len([template for template in templates if template["is_system"]]) == 2


async def test_system_templates_are_read_only(client: AsyncClient) -> None:
    system = await _system_template(client, "invitation")

    renamed = await client.patch(f"/templates/{system['id']}", json={"name": "Moja"})
    deleted = await client.delete(f"/templates/{system['id']}")

    assert renamed.status_code == 403
    assert deleted.status_code == 403


async def test_copy_rename_and_delete(client: AsyncClient) -> None:
    system = await _system_template(client, "envelope")
    copy = await _own_copy(client, "envelope")

    assert copy["is_system"] is False
    assert copy["name"] == "Koperta DL z okienkiem (kopia)"
    assert copy["fields"] == system["fields"]

    renamed = await client.patch(f"/templates/{copy['id']}", json={"name": "  Moja koperta "})
    assert renamed.status_code == 200
    assert renamed.json()["name"] == "Moja koperta"
    assert renamed.json()["fields"] == system["fields"]

    templates = (await client.get("/templates")).json()
    assert [template["is_system"] for template in templates] == [True, True, False]

    assert (await client.delete(f"/templates/{copy['id']}")).status_code == 204
    assert (await client.get(f"/templates/{copy['id']}")).status_code == 404


async def test_copy_name_stays_within_the_limit(client: AsyncClient) -> None:
    copy = await _own_copy(client)
    await client.patch(f"/templates/{copy['id']}", json={"name": "x" * 200})

    second = (await client.post(f"/templates/{copy['id']}/copy")).json()

    assert len(second["name"]) == 200
    assert second["name"].endswith(" (kopia)")


async def test_other_users_templates_are_hidden(client: AsyncClient) -> None:
    copy = await _own_copy(client)
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"

    assert (await client.get(f"/templates/{copy['id']}")).status_code == 404
    assert (await client.post(f"/templates/{copy['id']}/copy")).status_code == 404
    assert (await client.patch(f"/templates/{copy['id']}", json={"name": "X"})).status_code == 404
    assert (await client.delete(f"/templates/{copy['id']}")).status_code == 404
    templates = (await client.get("/templates")).json()
    assert all(template["is_system"] for template in templates)


async def test_fields_are_saved_with_defaults_and_placeholder_names(client: AsyncClient) -> None:
    copy = await _own_copy(client)

    response = await client.patch(
        f"/templates/{copy['id']}",
        json={"fields": [_field(content="Dla: {adresat} ({ZWROT  grzecznosciowy})")]},
    )

    assert response.status_code == 200
    [field] = response.json()["fields"]
    assert field["content"] == "Dla: {recipient} ({salutation})"
    assert field["font"] == "serif"
    assert field["cases"] == {}
    assert response.json()["name"] == copy["name"]


async def test_invalid_fields_are_rejected(client: AsyncClient) -> None:
    copy = await _own_copy(client)
    url = f"/templates/{copy['id']}"

    unknown = await client.patch(url, json={"fields": [_field(content="{pesel}")]})
    assert unknown.status_code == 422
    assert "{pesel}" in unknown.json()["detail"]

    outside = await client.patch(url, json={"fields": [_field(x_mm=100, width_mm=100)]})
    assert outside.status_code == 422
    assert "poza stronę" in outside.json()["detail"]

    missing_page = await client.patch(url, json={"fields": [_field(page=1)]})
    assert missing_page.status_code == 422

    for invalid in ({"color": "red"}, {"font": "comic"}, {"cases": {"recipient": "abl"}}):
        response = await client.patch(url, json={"fields": [_field(**invalid)]})
        assert response.status_code == 422, invalid

    saved = (await client.get(url)).json()
    assert saved["fields"] == copy["fields"]


async def test_editor_reference_lists(client: AsyncClient) -> None:
    placeholders = (await client.get("/templates/placeholders")).json()
    date_formats = (await client.get("/templates/date-formats")).json()
    cases = (await client.get("/templates/cases")).json()

    assert {"salutation", "recipient_block", "event_date"} <= {
        placeholder["name"] for placeholder in placeholders
    }
    assert date_formats[0] == {"value": "long", "example": "15 października 2026 r."}
    assert {"value": "roman", "example": "15 X 2026 r."} in date_formats
    dative = next(case for case in cases if case["value"] == "dat")
    assert dative["examples"]["position"] == "Rektorowi"
    assert dative["examples"]["recipient"] == "prof. dr. hab. Janowi Kowalskiemu"
    assert cases[0]["examples"]["institution"] == "Politechnika Warszawska"


async def test_templates_require_sign_in(anonymous_client: AsyncClient) -> None:
    assert (await anonymous_client.get("/templates")).status_code == 401


def test_to_storage_keeps_unknown_names() -> None:
    assert to_storage("{Imię i nazwisko}, {nieznane}") == "{full_name}, {nieznane}"
