from datetime import UTC, datetime

from httpx import AsyncClient
from sqlalchemy import update

from app.main import app
from app.models import Guest, VerificationStatus
from tests.conftest import OTHER_SESSION_COOKIE

JAN = {
    "full_name": "Jan Kowalski",
    "position": "Dyrektor",
    "institution": "Muzeum Narodowe",
    "salutation": "Szanowny Panie Dyrektorze",
    "street": "ul. Długa 1",
    "postal_code": "00-001",
    "city": "Warszawa",
    "country": "PL",
}


async def _mark_verified(guest_id: int) -> None:
    async with app.state.sessionmaker() as session, session.begin():
        await session.execute(
            update(Guest)
            .where(Guest.id == guest_id)
            .values(
                verification_status=VerificationStatus.VERIFIED_MANUAL,
                verified_at=datetime.now(UTC),
                declension={"full_name": {"gen": "Jana Kowalskiego"}},
            )
        )


async def test_create_and_read_guest(client: AsyncClient) -> None:
    created = await client.post("/guests", json={**JAN, "full_name": "  Jan Kowalski "})

    assert created.status_code == 201
    guest = created.json()
    assert {field: guest[field] for field in JAN} == JAN
    assert guest["verification_status"] == "pending"
    assert guest["declension"] is None
    assert guest["verification_result"] is None
    assert guest["verified_at"] is None
    assert guest["created_at"]
    assert guest["updated_at"] == guest["created_at"]

    fetched = await client.get(f"/guests/{guest['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == guest


async def test_institution_alone_is_a_recipient(client: AsyncClient) -> None:
    response = await client.post(
        "/guests", json={"full_name": "  ", "institution": "Redakcja Gazety"}
    )

    assert response.status_code == 201
    assert response.json()["full_name"] is None
    assert response.json()["institution"] == "Redakcja Gazety"


async def test_rejects_guest_without_person_or_institution(client: AsyncClient) -> None:
    response = await client.post("/guests", json={"position": "Dyrektor", "full_name": ""})

    assert response.status_code == 422
    assert "Podaj imię i nazwisko albo instytucję" in response.text


async def test_address_is_optional_and_country_defaults_to_poland(client: AsyncClient) -> None:
    response = await client.post("/guests", json={"full_name": "Jan", "city": " "})

    assert response.status_code == 201
    guest = response.json()
    assert (guest["street"], guest["postal_code"], guest["city"]) == (None, None, None)
    assert guest["country"] == "PL"


async def test_country_is_an_upper_case_iso_code(client: AsyncClient) -> None:
    accepted = await client.post("/guests", json={"full_name": "Jan", "country": "de"})
    rejected = await client.post("/guests", json={"full_name": "Jan", "country": "Polska"})

    assert accepted.json()["country"] == "DE"
    assert rejected.status_code == 422


async def test_rejects_too_long_fields(client: AsyncClient) -> None:
    response = await client.post("/guests", json={"full_name": "x" * 301})

    assert response.status_code == 422


async def test_list_guests_in_creation_order(client: AsyncClient) -> None:
    for name in ["Anna", "Piotr"]:
        await client.post("/guests", json={"full_name": name})

    response = await client.get("/guests")

    assert response.status_code == 200
    assert [guest["full_name"] for guest in response.json()] == ["Anna", "Piotr"]


async def test_missing_guest_returns_404(client: AsyncClient) -> None:
    response = await client.get("/guests/999")

    assert response.status_code == 404


async def test_replace_guest_resets_verification(client: AsyncClient) -> None:
    created = (await client.post("/guests", json=JAN)).json()
    await _mark_verified(created["id"])

    response = await client.put(f"/guests/{created['id']}", json={**JAN, "full_name": "Jan Nowak"})

    assert response.status_code == 200
    guest = response.json()
    assert guest["full_name"] == "Jan Nowak"
    assert guest["verification_status"] == "pending"
    assert guest["verified_at"] is None
    assert guest["declension"] is None
    assert (await client.get(f"/guests/{created['id']}")).json() == guest


async def test_replace_with_same_data_keeps_verification(client: AsyncClient) -> None:
    created = (await client.post("/guests", json=JAN)).json()
    await _mark_verified(created["id"])

    response = await client.put(f"/guests/{created['id']}", json=JAN)

    assert response.json()["verification_status"] == "verified_manual"
    assert response.json()["declension"] == {
        "full_name": {"gen": "Jana Kowalskiego"},
        "position": {},
        "institution": {},
    }


async def test_salutation_change_keeps_declension(client: AsyncClient) -> None:
    created = (await client.post("/guests", json=JAN)).json()
    await _mark_verified(created["id"])

    response = await client.put(
        f"/guests/{created['id']}", json={**JAN, "salutation": "Szanowny Panie"}
    )

    assert response.json()["verification_status"] == "pending"
    assert response.json()["declension"] is not None


async def test_replace_missing_guest_returns_404(client: AsyncClient) -> None:
    response = await client.put("/guests/999", json={"full_name": "Jan"})

    assert response.status_code == 404


async def test_guests_are_private_to_their_owner(client: AsyncClient) -> None:
    created = (await client.post("/guests", json={"full_name": "Jan"})).json()
    other = {"Authorization": f"Bearer {OTHER_SESSION_COOKIE}"}

    assert (await client.get("/guests", headers=other)).json() == []
    assert (await client.get(f"/guests/{created['id']}", headers=other)).status_code == 404
    replaced = await client.put(f"/guests/{created['id']}", json={"full_name": "X"}, headers=other)
    assert replaced.status_code == 404
    assert (await client.get(f"/guests/{created['id']}")).json() == created


async def test_address_change_resets_verification_but_keeps_declension(
    client: AsyncClient,
) -> None:
    created = (await client.post("/guests", json=JAN)).json()
    await _mark_verified(created["id"])

    response = await client.put(f"/guests/{created['id']}", json={**JAN, "city": "Kraków"})

    guest = response.json()
    assert guest["city"] == "Kraków"
    assert guest["verification_status"] == "pending"
    assert guest["declension"] is not None


async def test_replace_bumps_updated_at(client: AsyncClient) -> None:
    created = (await client.post("/guests", json=JAN)).json()

    replaced = (
        await client.put(f"/guests/{created['id']}", json={**JAN, "position": "Wicedyrektor"})
    ).json()

    assert replaced["created_at"] == created["created_at"]
    assert replaced["updated_at"] > created["updated_at"]
