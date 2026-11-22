from collections.abc import Iterator
from typing import Any

import pytest
from httpx import AsyncClient
from sqlalchemy import update

from app.main import app
from app.models import Guest
from app.schemas.guests import FieldCheck
from app.services.verification import AI_FIELDS
from app.verifier import GuestCheck, GuestData, VerifierUnavailableError, get_verifier
from tests.conftest import OTHER_SESSION_COOKIE

GUEST = {
    "full_name": "dr Jan Kowalski",
    "position": "dyrektor",
    "institution": "Muzeum Narodowe",
    "salutation": "Szanowny Panie Dyrektorze",
    "street": "ul. Długa 1",
    "postal_code": "00-001",
    "city": "Warszawa",
    "country": "PL",
}
OK = FieldCheck(status="ok", explanation="Bez uwag.")


def _check(**fields: Any) -> GuestCheck:
    values: dict[str, Any] = dict.fromkeys(AI_FIELDS, OK)
    values |= {"salutation": GUEST["salutation"]}
    values |= {"salutation_explanation": "Zwrot do dyrektora.", "summary": "Dane są poprawne."}
    return GuestCheck(**(values | fields))


class FakeVerifier:
    model = "fake-model"

    def __init__(self) -> None:
        self.check: GuestCheck = _check()
        self.unavailable = False
        self.asked: list[GuestData] = []
        self.before_answer: Any = None

    async def verify(self, guest: GuestData) -> GuestCheck:
        self.asked.append(guest)
        if self.before_answer is not None:
            await self.before_answer()
        if self.unavailable:
            raise VerifierUnavailableError
        return self.check


@pytest.fixture
def verifier() -> Iterator[FakeVerifier]:
    fake = FakeVerifier()
    app.dependency_overrides[get_verifier] = lambda: fake
    yield fake
    app.dependency_overrides.pop(get_verifier, None)


async def _guest(client: AsyncClient) -> int:
    response = await client.post("/guests", json=GUEST)
    return int(response.json()["id"])


async def test_a_guest_without_issues_is_verified_by_ai(
    client: AsyncClient, verifier: FakeVerifier
) -> None:
    guest_id = await _guest(client)

    response = await client.post(f"/guests/{guest_id}/verification/ai")

    assert response.status_code == 200
    guest = response.json()
    assert guest["verification_status"] == "verified_ai"
    assert guest["verified_at"] is not None
    assert guest["verification_result"]["model"] == "fake-model"
    assert verifier.asked[0].full_name == "dr Jan Kowalski"


async def test_suggestions_need_review_and_accepted_ones_are_applied(
    client: AsyncClient, verifier: FakeVerifier
) -> None:
    guest_id = await _guest(client)
    verifier.check = _check(
        position=FieldCheck(status="warning", suggestion="Dyrektor", explanation="Wielka litera."),
        city=FieldCheck(status="warning", suggestion="Kraków", explanation="Kod nie pasuje."),
        salutation="Szanowny Panie Doktorze",
    )

    checked = (await client.post(f"/guests/{guest_id}/verification/ai")).json()
    accepted = await client.post(
        f"/guests/{guest_id}/verification/ai/accept", json={"accept": ["position", "salutation"]}
    )

    assert checked["verification_status"] == "needs_review"
    assert checked["verified_at"] is None
    assert checked["verification_result"]["fields"]["city"]["suggestion"] == "Kraków"
    assert accepted.status_code == 200
    guest = accepted.json()
    assert (guest["position"], guest["city"]) == ("Dyrektor", "Warszawa")
    assert guest["salutation"] == "Szanowny Panie Doktorze"
    assert guest["verification_status"] == "verified_ai"
    assert guest["declension"]["position"]["dat"] == "Dyrektorowi"


async def test_an_unavailable_model_fails_the_check_without_touching_the_data(
    client: AsyncClient, verifier: FakeVerifier
) -> None:
    guest_id = await _guest(client)
    verifier.unavailable = True

    guest = (await client.post(f"/guests/{guest_id}/verification/ai")).json()

    assert guest["verification_status"] == "failed"
    assert guest["verification_result"]["error"].startswith("Nie udało się zapytać AI")
    assert guest["position"] == "dyrektor"


async def test_a_guest_changed_during_the_check_is_not_overwritten(
    client: AsyncClient, verifier: FakeVerifier
) -> None:
    guest_id = await _guest(client)

    async def edit_meanwhile() -> None:
        async with app.state.sessionmaker() as session, session.begin():
            await session.execute(
                update(Guest).where(Guest.id == guest_id).values(position="Kustosz")
            )

    verifier.before_answer = edit_meanwhile

    response = await client.post(f"/guests/{guest_id}/verification/ai")

    assert response.status_code == 409
    assert (await client.get(f"/guests/{guest_id}")).json()["verification_status"] == "pending"


async def test_accepting_needs_an_ai_result_and_a_valid_guest(
    client: AsyncClient, verifier: FakeVerifier
) -> None:
    guest_id = await _guest(client)
    before = await client.post(f"/guests/{guest_id}/verification/ai/accept", json={"accept": []})
    verifier.check = _check(
        institution=FieldCheck(status="warning", suggestion="M" * 400, explanation="Za długie.")
    )
    await client.post(f"/guests/{guest_id}/verification/ai")

    too_long = await client.post(
        f"/guests/{guest_id}/verification/ai/accept", json={"accept": ["institution"]}
    )

    assert before.status_code == 409
    assert too_long.status_code == 422
    assert (await client.get(f"/guests/{guest_id}")).json()["institution"] == "Muzeum Narodowe"


async def test_ai_verification_is_private_to_the_owner(
    client: AsyncClient, verifier: FakeVerifier
) -> None:
    guest_id = await _guest(client)
    client.headers["Authorization"] = f"Bearer {OTHER_SESSION_COOKIE}"

    checked = await client.post(f"/guests/{guest_id}/verification/ai")
    accepted = await client.post(f"/guests/{guest_id}/verification/ai/accept", json={})

    assert (checked.status_code, accepted.status_code) == (404, 404)
    assert verifier.asked == []
