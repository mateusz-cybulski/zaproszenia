from typing import Any

from app.geocoder import (
    FOUND,
    NOT_FOUND,
    SKIPPED_NO_ADDRESS,
    GoogleAddressChecker,
    address_check_from,
)
from app.verifier import GuestData

GUEST = GuestData(None, None, "Muzeum", None, "ul. Długa 1", "00-001", "Warszawa", "PL")


def _result(postal_code: str, city: str, **extra: Any) -> dict[str, Any]:
    return {
        "address_components": [
            {"long_name": postal_code, "types": ["postal_code"]},
            {"long_name": city, "types": ["locality", "political"]},
        ],
        "formatted_address": f"Długa 1, {postal_code} {city}, Polska",
        "geometry": {"location_type": "ROOFTOP"},
        "types": ["street_address"],
    } | extra


def test_a_matching_precise_address_is_ok() -> None:
    check = address_check_from({"status": "OK", "results": [_result("00-001", "Warszawa")]}, GUEST)

    assert (check.status, check.explanation) == ("ok", FOUND)
    assert check.matched_label == "Długa 1, 00-001 Warszawa, Polska"


def test_another_postal_code_city_or_an_approximate_hit_warn() -> None:
    approximate = _result("00-950", "Kraków", partial_match=True)

    check = address_check_from({"status": "OK", "results": [approximate]}, GUEST)

    assert check.status == "warning"
    assert "00-950" in check.explanation and "Kraków" in check.explanation
    assert "w przybliżeniu" in check.explanation
    assert (check.suggested_postal_code, check.suggested_city) == ("00-950", "Kraków")


def test_no_result_is_an_error_and_a_refused_request_is_skipped() -> None:
    missing = address_check_from({"status": "ZERO_RESULTS", "results": []}, GUEST)
    refused = address_check_from({"status": "REQUEST_DENIED", "error_message": "bad key"}, GUEST)

    assert (missing.status, missing.explanation) == ("error", NOT_FOUND)
    assert refused.status == "skipped"


async def test_an_address_without_street_is_not_looked_up() -> None:
    guest = GuestData(None, None, "Muzeum", None, None, None, "Warszawa", "PL")

    check = await GoogleAddressChecker("key").check(guest)

    assert (check.status, check.explanation) == ("skipped", SKIPPED_NO_ADDRESS)
