import io

from httpx import AsyncClient
from pypdf import PdfWriter

from app.storage import LocalStorage
from tests.conftest import OTHER_SESSION_COOKIE, USER, FakeIdentity

SENDER = {
    "sender_name": "Fundacja Przykładowa",
    "street": "ul. Długa 5",
    "postal_code": "00-001",
    "city": "Warszawa",
    "country": "PL",
}


def _pdf() -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=420, height=595)
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


async def test_new_user_gets_empty_sender(client: AsyncClient) -> None:
    me = (await client.get("/me")).json()

    assert me == {
        "email": USER.email,
        "sender_name": None,
        "street": None,
        "postal_code": None,
        "city": None,
        "country": "PL",
        "sender_complete": False,
    }


async def test_sender_is_saved_and_complete(client: AsyncClient) -> None:
    saved = await client.put("/me", json={**SENDER, "sender_name": "  Fundacja Przykładowa "})

    assert saved.status_code == 200
    assert saved.json() == {"email": USER.email, **SENDER, "sender_complete": True}
    assert (await client.get("/me")).json() == saved.json()

    cleared = (await client.put("/me", json={**SENDER, "street": "  "})).json()
    assert cleared["street"] is None
    assert cleared["sender_complete"] is False


async def test_sender_fields_are_validated(client: AsyncClient) -> None:
    assert (await client.put("/me", json={**SENDER, "country": "Polska"})).status_code == 422
    assert (await client.put("/me", json={**SENDER, "city": "x" * 201})).status_code == 422
    assert (await client.put("/me", json={**SENDER, "country": "de"})).json()["country"] == "DE"


async def test_sender_is_private_to_the_user(client: AsyncClient) -> None:
    await client.put("/me", json=SENDER)
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"

    assert (await client.get("/me")).json()["sender_name"] is None


async def test_delete_me_removes_all_data_files_and_account(
    client: AsyncClient, storage: LocalStorage, identity: FakeIdentity
) -> None:
    await client.put("/me", json=SENDER)
    guest = (await client.post("/guests", json={"full_name": "Jan Kowalski"})).json()
    deleted_guest = (await client.post("/guests", json={"full_name": "Anna Nowak"})).json()
    await client.delete(f"/guests/{deleted_guest['id']}")
    template = await client.post(
        "/templates",
        data={"name": "Karta", "kind": "invitation"},
        files={"file": ("karta.pdf", _pdf(), "application/pdf")},
    )
    assert template.status_code == 201
    assert list(storage.root.rglob("*.pdf"))
    event = await client.post("/events", json={"name": "Gala", "starts_at": "2026-10-15T18:00"})
    assert event.status_code == 201

    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"
    other_guest = (await client.post("/guests", json={"full_name": "Obcy Gość"})).json()
    client.headers["Authorization"] = "Bearer session-cookie"

    assert (await client.delete("/me")).status_code == 204

    assert identity.deleted == [USER.uid]
    assert (await client.get("/guests")).json()["items"] == []
    assert (await client.get("/guests", params={"deleted": "true"})).json()["items"] == []
    assert (await client.get(f"/guests/{guest['id']}")).status_code == 404
    templates = (await client.get("/templates")).json()
    assert [template["is_system"] for template in templates] == [True, True]
    assert (await client.get("/me")).json()["sender_name"] is None
    assert (await client.get("/events")).json()["items"] == []
    assert list(storage.root.rglob("*.pdf")) == []

    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"
    assert (await client.get(f"/guests/{other_guest['id']}")).status_code == 200


async def test_delete_me_reports_an_account_it_could_not_remove(
    client: AsyncClient, identity: FakeIdentity
) -> None:
    await client.post("/guests", json={"full_name": "Jan Kowalski"})
    identity.unavailable = True

    response = await client.delete("/me")

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "account_kept"
    assert (await client.get("/guests")).json()["items"] == []
