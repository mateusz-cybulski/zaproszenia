from collections.abc import Iterator
from typing import Any

import google.auth
import pytest
from google.auth.exceptions import DefaultCredentialsError
from google.genai import errors
from httpx import AsyncClient
from sqlalchemy import update

from app import verifier as verifier_module
from app.geocoder import get_address_checker
from app.main import app
from app.models import Guest
from app.schemas.guests import AddressCheck, FieldCheck
from app.services.verification import AI_FIELDS
from app.verifier import (
    GeminiGuestVerifier,
    GuestCheck,
    GuestData,
    VerifierUnavailableError,
    get_verifier,
)
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
        self.addresses: list[AddressCheck | None] = []
        self.before_answer: Any = None

    async def verify(self, guest: GuestData, address: AddressCheck | None) -> GuestCheck:
        self.asked.append(guest)
        self.addresses.append(address)
        if self.before_answer is not None:
            await self.before_answer()
        if self.unavailable:
            raise VerifierUnavailableError
        return self.check


class FakeAddressChecker:
    def __init__(self) -> None:
        self.result = AddressCheck(status="ok", explanation="Adres został odnaleziony.")

    async def check(self, guest: GuestData) -> AddressCheck:
        return self.result


@pytest.fixture
def addresses() -> Iterator[FakeAddressChecker]:
    fake = FakeAddressChecker()
    app.dependency_overrides[get_address_checker] = lambda: fake
    yield fake
    app.dependency_overrides.pop(get_address_checker, None)


@pytest.fixture
def verifier(addresses: FakeAddressChecker) -> Iterator[FakeVerifier]:
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


async def test_queue_lists_unchecked_and_failed_guests_only(
    client: AsyncClient, verifier: FakeVerifier
) -> None:
    unchecked, failed, verified, deleted = [await _guest(client) for _ in range(4)]
    verifier.unavailable = True
    await client.post(f"/guests/{failed}/verification/ai")
    verifier.unavailable = False
    await client.post(f"/guests/{verified}/verification/ai")
    await client.delete(f"/guests/{deleted}")

    queue = (await client.get("/guests/verification/queue")).json()

    assert queue == {"guest_ids": [unchecked, failed]}


async def test_missing_credentials_make_the_model_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def no_credentials() -> None:
        raise DefaultCredentialsError("no ADC")  # type: ignore[no-untyped-call]

    monkeypatch.setattr(google.auth, "default", no_credentials)
    verifier = GeminiGuestVerifier("gemini", None, "global")

    with pytest.raises(VerifierUnavailableError):
        await verifier.verify(GuestData(None, None, "Muzeum", None, None, None, None, "PL"), None)


class FlakyModels:
    """Answers like Gemini: first a timeout on Google's side, then the check."""

    def __init__(self, failures: list[int]) -> None:
        self.failures = failures
        self.calls = 0

    async def generate_content(self, **_: Any) -> Any:
        self.calls += 1
        if self.failures:
            code = self.failures.pop(0)
            raise errors.APIError(code, {"error": {"code": code, "message": "x", "status": "x"}})
        return type("Response", (), {"text": _check().model_dump_json()})()


def _verifier_with(models: FlakyModels) -> GeminiGuestVerifier:
    verifier = GeminiGuestVerifier("gemini", None, "global")
    verifier._client = type("Client", (), {"aio": type("Aio", (), {"models": models})()})()
    return verifier


async def test_transient_gemini_errors_are_retried(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(verifier_module, "RETRY_DELAY_SECONDS", 0)
    flaky = FlakyModels([504, 429])
    data = GuestData(None, None, "Muzeum", None, None, None, None, "PL")

    check = await _verifier_with(flaky).verify(data, None)
    rejected = FlakyModels([400])

    assert check.summary == "Dane są poprawne."
    assert flaky.calls == 3
    with pytest.raises(VerifierUnavailableError):
        await _verifier_with(rejected).verify(data, None)
    assert rejected.calls == 1


async def test_an_address_warning_needs_review_and_reaches_the_model(
    client: AsyncClient, verifier: FakeVerifier, addresses: FakeAddressChecker
) -> None:
    guest_id = await _guest(client)
    addresses.result = AddressCheck(
        status="warning",
        explanation="Sprawdzenie adresu: kod pocztowy dla tego adresu to 00-950.",
        suggested_postal_code="00-950",
    )

    guest = (await client.post(f"/guests/{guest_id}/verification/ai")).json()

    assert guest["verification_status"] == "needs_review"
    assert guest["verification_result"]["address_check"]["suggested_postal_code"] == "00-950"
    assert verifier.addresses[0] == addresses.result


async def test_remarks_about_empty_fields_are_dropped(
    client: AsyncClient, verifier: FakeVerifier
) -> None:
    response = await client.post("/guests", json={**GUEST, "position": None})
    guest_id = response.json()["id"]
    verifier.check = _check(
        position=FieldCheck(status="error", suggestion="Dyrektor", explanation="Brak stanowiska.")
    )

    guest = (await client.post(f"/guests/{guest_id}/verification/ai")).json()

    assert guest["verification_status"] == "verified_ai"
    assert guest["verification_result"]["fields"]["position"]["suggestion"] is None
