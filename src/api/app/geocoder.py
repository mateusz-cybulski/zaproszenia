"""Address checks against Google's Geocoding API.

Facts such as whether an address exists and which postal code it has come from the source of
the data, not from a language model that could make them up.
"""

import logging
from functools import lru_cache
from typing import Annotated, Any, Protocol

import httpx
from fastapi import Depends

from app.schemas.guests import AddressCheck
from app.settings import get_settings
from app.verifier import GuestData

logger = logging.getLogger(__name__)

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
REQUEST_TIMEOUT_SECONDS = 10
# A precise hit: a building, or a point interpolated along a street segment.
PRECISE_LOCATION_TYPES = frozenset({"ROOFTOP", "RANGE_INTERPOLATED"})

SKIPPED_NO_ADDRESS = "Brak ulicy lub miejscowości, adresu nie sprawdzono."
SKIPPED_UNAVAILABLE = "Usługa sprawdzania adresów jest niedostępna."
NOT_FOUND = "Nie znaleziono takiego adresu."
FOUND = "Adres został odnaleziony."


class AddressChecker(Protocol):
    async def check(self, guest: GuestData) -> AddressCheck: ...


def _normalized(value: str | None) -> str:
    return "".join((value or "").split()).casefold()


def _component(result: dict[str, Any], kind: str) -> str | None:
    for component in result.get("address_components", []):
        if kind in component.get("types", []):
            return str(component["long_name"])
    return None


def _is_precise(result: dict[str, Any]) -> bool:
    if result.get("partial_match"):
        return False
    location_type = result.get("geometry", {}).get("location_type")
    # The street alone is enough too, e.g. for an address with a flat number.
    street_only = location_type == "GEOMETRIC_CENTER" and "route" in result.get("types", [])
    return location_type in PRECISE_LOCATION_TYPES or street_only


def _sentence(problems: list[str]) -> str:
    text = "; ".join(problems)
    return f"{text[0].upper()}{text[1:]}."


def address_check_from(response: dict[str, Any], guest: GuestData) -> AddressCheck:
    """Reads a Geocoding API response for the guest's address."""
    api_status = response.get("status")
    if api_status == "ZERO_RESULTS":
        return AddressCheck(status="error", explanation=NOT_FOUND)
    if api_status != "OK" or not response.get("results"):
        # E.g. REQUEST_DENIED (a wrong key) or OVER_QUERY_LIMIT: not the address's fault.
        logger.warning("Geocoding returned %s: %s", api_status, response.get("error_message"))
        return AddressCheck(status="skipped", explanation=SKIPPED_UNAVAILABLE)
    item = response["results"][0]
    found_code = _component(item, "postal_code")
    found_city = _component(item, "locality") or _component(item, "postal_town")
    problems = []
    if (
        found_code
        and guest.postal_code
        and _normalized(found_code) != _normalized(guest.postal_code)
    ):
        problems.append(f"kod pocztowy dla tego adresu to {found_code}")
    if found_city and _normalized(found_city) != _normalized(guest.city):
        problems.append(f"miejscowość to {found_city}")
    if not _is_precise(item):
        problems.append("adres odnaleziono tylko w przybliżeniu")
    return AddressCheck(
        status="warning" if problems else "ok",
        explanation=_sentence(problems) if problems else FOUND,
        suggested_postal_code=found_code,
        suggested_city=found_city,
        matched_label=item.get("formatted_address"),
    )


class GoogleAddressChecker:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    async def check(self, guest: GuestData) -> AddressCheck:
        if not (guest.street and guest.city):
            return AddressCheck(status="skipped", explanation=SKIPPED_NO_ADDRESS)
        city_line = f"{guest.postal_code or ''} {guest.city}".strip()
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
                response = await client.get(
                    GEOCODE_URL,
                    params={
                        "address": f"{guest.street}, {city_line}",
                        "components": f"country:{guest.country}",
                        "language": "pl",
                        "key": self.api_key,
                    },
                )
                response.raise_for_status()
        except httpx.HTTPError as error:
            logger.warning("Geocoding failed: %s", type(error).__name__)
            return AddressCheck(status="skipped", explanation=SKIPPED_UNAVAILABLE)
        return address_check_from(response.json(), guest)


class NoAddressChecker:
    """Without a Geocoding API key (local development) addresses are left to the model."""

    async def check(self, guest: GuestData) -> AddressCheck:
        return AddressCheck(status="skipped", explanation=SKIPPED_UNAVAILABLE)


@lru_cache
def get_address_checker() -> AddressChecker:
    key = get_settings().geocoding_api_key
    return GoogleAddressChecker(key.get_secret_value()) if key else NoAddressChecker()


Checker = Annotated[AddressChecker, Depends(get_address_checker)]
