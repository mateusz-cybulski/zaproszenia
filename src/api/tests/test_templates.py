import io
from typing import Any

import pytest
from httpx import AsyncClient
from pypdf import PdfReader, PdfWriter

from app.main import app
from app.services.pdf import POINTS_PER_MM
from app.services.placeholders import fill, guest_values, to_storage
from app.services.templates import ensure_system_templates
from app.storage import LocalStorage
from tests.conftest import OTHER_SESSION_COOKIE


def _pdf(width_mm: float = 148, height_mm: float = 210, pages: int = 1, rotate: int = 0) -> bytes:
    writer = PdfWriter()
    for _ in range(pages):
        page = writer.add_blank_page(
            width=width_mm * POINTS_PER_MM, height=height_mm * POINTS_PER_MM
        )
        page.rotate(rotate)
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


async def _upload(client: AsyncClient, pdf: bytes, kind: str = "invitation") -> Any:
    return await client.post(
        "/templates",
        data={"name": "  Karta od grafika ", "kind": kind},
        files={"file": ("karta.pdf", pdf, "application/pdf")},
    )


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


async def test_upload_pdf_template(client: AsyncClient, storage: LocalStorage) -> None:
    response = await _upload(client, _pdf())

    assert response.status_code == 201, response.text
    template = response.json()
    assert template["name"] == "Karta od grafika"
    assert template["has_file"] is True
    assert template["is_system"] is False
    assert template["pages"] == [{"width_mm": 148.0, "height_mm": 210.0}]
    assert "{salutation}," in [field["content"] for field in template["fields"]]
    assert list(storage.root.rglob("*.pdf")) == [
        storage.root / "users" / "user-1" / "templates" / f"{template['id']}.pdf"
    ]

    original = await client.get(f"/templates/{template['id']}/file")
    assert original.status_code == 200
    assert original.headers["content-type"] == "application/pdf"
    assert len(PdfReader(io.BytesIO(original.content)).pages) == 1


async def test_envelope_upload_gets_the_envelope_layout(client: AsyncClient) -> None:
    template = (await _upload(client, _pdf(220, 110), kind="envelope")).json()

    assert [field["id"] for field in template["fields"]] == ["sender", "recipient"]


async def test_rotated_pages_are_measured_as_displayed(client: AsyncClient) -> None:
    template = (await _upload(client, _pdf(148, 210, pages=2, rotate=90))).json()

    assert template["pages"] == [{"width_mm": 210.0, "height_mm": 148.0}] * 2
    original = await client.get(f"/templates/{template['id']}/file")
    assert PdfReader(io.BytesIO(original.content)).pages[0].rotation == 0


async def test_invalid_uploads_are_rejected(client: AsyncClient, storage: LocalStorage) -> None:
    writer = PdfWriter(clone_from=PdfReader(io.BytesIO(_pdf())))
    writer.encrypt("tajne")
    encrypted = io.BytesIO()
    writer.write(encrypted)

    cases = {
        b"to nie jest pdf": "poprawny plik PDF",
        _pdf(pages=5): "najwyżej 4 strony",
        encrypted.getvalue(): "hasłem",
    }
    for pdf, message in cases.items():
        response = await _upload(client, pdf)
        assert response.status_code == 422
        assert message in response.json()["detail"]
    assert (await _upload(client, _pdf(), kind="poster")).status_code == 422
    assert not storage.root.exists()
    templates = (await client.get("/templates")).json()
    assert all(template["is_system"] for template in templates)


async def test_too_large_upload_is_rejected(client: AsyncClient) -> None:
    response = await _upload(client, _pdf() + b" " * (15 * 1024 * 1024))

    assert response.status_code == 413


async def test_copy_has_its_own_file(client: AsyncClient, storage: LocalStorage) -> None:
    original = (await _upload(client, _pdf())).json()
    copy = (await client.post(f"/templates/{original['id']}/copy")).json()

    assert copy["has_file"] is True
    assert (await client.delete(f"/templates/{original['id']}")).status_code == 204

    assert len(list(storage.root.rglob("*.pdf"))) == 1
    assert (await client.get(f"/templates/{copy['id']}/file")).status_code == 200


async def test_files_follow_template_access(client: AsyncClient) -> None:
    own = (await _upload(client, _pdf())).json()
    system = await _system_template(client, "invitation")

    assert system["has_file"] is False
    assert (await client.get(f"/templates/{system['id']}/file")).status_code == 404

    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"
    assert (await client.get(f"/templates/{own['id']}/file")).status_code == 404


async def test_failed_commit_removes_the_stored_file(
    client: AsyncClient, storage: LocalStorage, monkeypatch: Any
) -> None:
    async def fail_commit(self: Any) -> None:
        raise RuntimeError("database is gone")

    monkeypatch.setattr("sqlalchemy.ext.asyncio.AsyncSession.commit", fail_commit)
    with pytest.raises(RuntimeError, match="database is gone"):
        await _upload(client, _pdf())
    monkeypatch.undo()

    assert list(storage.root.rglob("*.pdf")) == []


def _text(pdf: bytes) -> str:
    return "\n".join(page.extract_text() for page in PdfReader(io.BytesIO(pdf)).pages)


async def test_preview_fills_the_default_layout_with_sample_data(client: AsyncClient) -> None:
    system = await _system_template(client, "invitation")

    response = await client.get(f"/templates/{system['id']}/preview")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    text = _text(response.content)
    assert "Szanowny Panie Rektorze," in text
    assert "Gala Jubileuszowa" in text
    assert "czwartek, 15 października 2026 r." in text
    assert "godz. 18:00" in text


async def test_preview_uses_field_cases_and_date_format(client: AsyncClient) -> None:
    template = (await _upload(client, _pdf())).json()
    fields = [
        _field(content="Dla {position} {institution}", cases={"position": "dat"}),
        _field(id="date", y_mm=60, content="{event_date}", date_format="roman"),
    ]
    await client.patch(f"/templates/{template['id']}", json={"fields": fields})

    text = _text((await client.get(f"/templates/{template['id']}/preview")).content)

    assert "Dla Rektorowi Politechnika Warszawska" in text
    assert "15 X 2026 r." in text


async def test_live_preview_image_does_not_save(client: AsyncClient) -> None:
    template = (await _upload(client, _pdf(pages=2))).json()
    url = f"/templates/{template['id']}"

    response = await client.post(f"{url}/preview.png", json={"fields": [_field()], "page": 1})

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content.startswith(b"\x89PNG")
    assert (await client.get(url)).json()["fields"] == template["fields"]

    unknown = await client.post(f"{url}/preview.png", json={"fields": [_field(content="{x}")]})
    assert unknown.status_code == 422
    missing_page = await client.post(f"{url}/preview.png", json={"fields": [], "page": 2})
    assert missing_page.status_code == 422


async def test_page_image(client: AsyncClient) -> None:
    template = (await _upload(client, _pdf())).json()
    system = await _system_template(client, "envelope")

    own = await client.get(f"/templates/{template['id']}/page.png")
    blank = await client.get(f"/templates/{system['id']}/page.png")
    missing = await client.get(f"/templates/{template['id']}/page.png", params={"page": 1})

    assert own.content.startswith(b"\x89PNG")
    assert blank.content.startswith(b"\x89PNG")
    assert missing.status_code == 404


async def test_previews_follow_template_access(client: AsyncClient) -> None:
    template = (await _upload(client, _pdf())).json()
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"
    url = f"/templates/{template['id']}"

    assert (await client.get(f"{url}/preview")).status_code == 404
    assert (await client.get(f"{url}/page.png")).status_code == 404
    assert (await client.post(f"{url}/preview.png", json={"fields": []})).status_code == 404


def test_fill_drops_lines_left_empty_and_expands_multiline_values() -> None:
    values = {
        "full_name": "Jan Kowalski",
        "position": "",
        "address": "ul. Długa 5\n00-001 Warszawa",
    }

    assert fill("{full_name}\n{position}\n{address}", values) == (
        "Jan Kowalski\nul. Długa 5\n00-001 Warszawa"
    )
    assert fill("A\n\nB", values) == "A\n\nB"


def test_whole_institution_heads_the_recipient_block() -> None:
    values = guest_values(
        {"institution": "Redakcja Radia Kraków", "city": "Kraków", "postal_code": "30-007"}
    )

    assert values["recipient"] == "Redakcja Radia Kraków"
    assert values["recipient_block"] == "Redakcja Radia Kraków\n30-007 Kraków"
    assert values["salutation"] == "Szanowni Państwo"
