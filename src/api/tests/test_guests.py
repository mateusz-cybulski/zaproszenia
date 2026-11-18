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


async def test_search_matches_name_or_institution_ignoring_case(client: AsyncClient) -> None:
    await client.post("/guests", json={"full_name": "Anna Kowalska", "institution": "Muzeum"})
    await client.post("/guests", json={"full_name": "Jan Nowak", "institution": "Teatr Kowalskich"})
    await client.post("/guests", json={"full_name": "Piotr Lis", "institution": "Urząd"})

    response = await client.get("/guests", params={"q": " kowal "})

    assert [guest["full_name"] for guest in response.json()] == ["Anna Kowalska", "Jan Nowak"]


async def test_search_treats_like_wildcards_as_text(client: AsyncClient) -> None:
    await client.post("/guests", json={"full_name": "Anna"})
    await client.post("/guests", json={"full_name": "100% Radio"})

    response = await client.get("/guests", params={"q": "%"})

    assert [guest["full_name"] for guest in response.json()] == ["100% Radio"]


async def test_verify_one_guest_manually(client: AsyncClient) -> None:
    created = (await client.post("/guests", json=JAN)).json()

    response = await client.post(f"/guests/{created['id']}/verification/manual")

    assert response.status_code == 200
    assert response.json()["verification_status"] == "verified_manual"
    assert response.json()["verified_at"]


async def test_verify_all_unverified_guests_manually(client: AsyncClient) -> None:
    ids = [(await client.post("/guests", json={"full_name": name})).json()["id"] for name in "ABC"]
    await _mark_verified(ids[0])

    response = await client.post("/guests/verification/manual", json={})

    assert response.json() == {"verified": 2}
    statuses = [guest["verification_status"] for guest in (await client.get("/guests")).json()]
    assert statuses == ["verified_manual"] * 3


async def test_verify_selected_guests_manually(client: AsyncClient) -> None:
    ids = [(await client.post("/guests", json={"full_name": name})).json()["id"] for name in "AB"]

    response = await client.post("/guests/verification/manual", json={"guest_ids": [ids[1]]})

    assert response.json() == {"verified": 1}
    statuses = [guest["verification_status"] for guest in (await client.get("/guests")).json()]
    assert statuses == ["pending", "verified_manual"]


async def test_manual_verification_leaves_other_owners_alone(client: AsyncClient) -> None:
    created = (await client.post("/guests", json={"full_name": "Jan"})).json()
    other = {"Authorization": f"Bearer {OTHER_SESSION_COOKIE}"}

    single = await client.post(f"/guests/{created['id']}/verification/manual", headers=other)
    bulk = await client.post("/guests/verification/manual", json={}, headers=other)

    assert single.status_code == 404
    assert bulk.json() == {"verified": 0}
    assert (await client.get(f"/guests/{created['id']}")).json()["verification_status"] == "pending"


async def test_soft_deleted_guest_leaves_the_list_and_can_be_restored(client: AsyncClient) -> None:
    jan = (await client.post("/guests", json=JAN)).json()
    anna = (await client.post("/guests", json={**JAN, "full_name": "Anna Nowak"})).json()

    assert (await client.delete(f"/guests/{jan['id']}")).status_code == 204

    active = (await client.get("/guests")).json()
    assert [guest["id"] for guest in active] == [anna["id"]]
    deleted = (await client.get("/guests", params={"deleted": "true"})).json()
    assert [guest["id"] for guest in deleted] == [jan["id"]]
    assert deleted[0]["deleted_at"] is not None
    assert (await client.get(f"/guests/{jan['id']}")).status_code == 404
    assert (await client.put(f"/guests/{jan['id']}", json=JAN)).status_code == 404
    assert (await client.delete(f"/guests/{jan['id']}")).status_code == 404

    restored = await client.post(f"/guests/{jan['id']}/restore")
    assert restored.status_code == 200
    assert restored.json()["deleted_at"] is None
    assert len((await client.get("/guests")).json()) == 2
    assert (await client.post(f"/guests/{jan['id']}/restore")).status_code == 404


async def test_permanent_delete_removes_active_and_deleted_guests(client: AsyncClient) -> None:
    jan = (await client.post("/guests", json=JAN)).json()
    anna = (await client.post("/guests", json={**JAN, "full_name": "Anna Nowak"})).json()
    await client.delete(f"/guests/{anna['id']}")

    for guest in (jan, anna):
        response = await client.delete(f"/guests/{guest['id']}", params={"permanent": "true"})
        assert response.status_code == 204

    assert (await client.get("/guests")).json() == []
    assert (await client.get("/guests", params={"deleted": "true"})).json() == []
    assert (await client.post(f"/guests/{anna['id']}/restore")).status_code == 404


async def test_deleted_list_is_newest_first(client: AsyncClient) -> None:
    ids = [
        (await client.post("/guests", json={**JAN, "full_name": name})).json()["id"]
        for name in ("A", "B")
    ]
    for guest_id in ids:
        await client.delete(f"/guests/{guest_id}")

    deleted = (await client.get("/guests", params={"deleted": "true"})).json()

    assert [guest["id"] for guest in deleted] == list(reversed(ids))


async def test_bulk_verification_skips_deleted_guests(client: AsyncClient) -> None:
    jan = (await client.post("/guests", json=JAN)).json()
    await client.delete(f"/guests/{jan['id']}")

    result = (await client.post("/guests/verification/manual", json={})).json()

    assert result == {"verified": 0}
    assert (await client.post(f"/guests/{jan['id']}/verification/manual")).status_code == 404


async def test_deleting_is_private_to_the_owner(client: AsyncClient) -> None:
    jan = (await client.post("/guests", json=JAN)).json()
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"

    assert (await client.delete(f"/guests/{jan['id']}")).status_code == 404
    permanent = await client.delete(f"/guests/{jan['id']}", params={"permanent": "true"})
    assert permanent.status_code == 404
    assert (await client.post(f"/guests/{jan['id']}/restore")).status_code == 404
