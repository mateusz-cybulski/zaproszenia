from datetime import UTC, datetime

from app.models import Guest, VerificationStatus
from app.schemas.guests import AddressCheck, FieldCheck, GuestWrite, VerificationResult
from app.services.declension import guest_declension
from app.verifier import GuestCheck, GuestData, GuestVerifier, VerifierUnavailableError

AI_FIELDS = ("full_name", "position", "institution", "street", "postal_code", "city")
AI_UNAVAILABLE = "Nie udało się zapytać AI. Spróbuj ponownie za chwilę."


def guest_data(guest: Guest) -> GuestData:
    return GuestData(
        full_name=guest.full_name,
        position=guest.position,
        institution=guest.institution,
        salutation=guest.salutation,
        street=guest.street,
        postal_code=guest.postal_code,
        city=guest.city,
        country=guest.country,
    )


def _needs_review(
    fields: dict[str, FieldCheck], salutation: str | None, address: AddressCheck, guest: Guest
) -> bool:
    if address.status in ("warning", "error"):
        return True
    if any(check.status != "ok" or check.suggestion for check in fields.values()):
        return True
    return bool(salutation) and salutation != guest.salutation


async def ask_ai(
    data: GuestData, address: AddressCheck, verifier: GuestVerifier
) -> GuestCheck | None:
    """The model's check of one guest, or None when it could not be asked."""
    try:
        return await verifier.verify(data, address)
    except VerifierUnavailableError:
        return None


def store_ai_result(
    guest: Guest, check: GuestCheck | None, address: AddressCheck, model: str
) -> None:
    checked_at = datetime.now(UTC)
    if check is None:
        result = VerificationResult(
            checked_at=checked_at, model=model, error=AI_UNAVAILABLE, address_check=address
        )
        guest.verification_status = VerificationStatus.FAILED
        guest.verification_result = result.model_dump(mode="json")
        guest.verified_at = None
        return
    fields = {field: getattr(check, field) for field in AI_FIELDS}
    result = VerificationResult(
        checked_at=checked_at,
        model=model,
        fields=fields,
        salutation=check.salutation,
        salutation_explanation=check.salutation_explanation,
        summary=check.summary,
        address_check=address,
    )
    guest.verification_result = result.model_dump(mode="json")
    if _needs_review(fields, check.salutation, address, guest):
        guest.verification_status = VerificationStatus.NEEDS_REVIEW
        guest.verified_at = None
    else:
        guest.verification_status = VerificationStatus.VERIFIED_AI
        guest.verified_at = checked_at


def accept_ai_result(guest: Guest, accepted: set[str]) -> None:
    """Applies the accepted suggestions and marks the guest verified by AI.

    Raises ValueError when there is no AI result to accept, and pydantic's ValidationError when the
    accepted values would not be a valid guest.
    """
    if guest.verification_result is None or guest.verification_status not in (
        VerificationStatus.NEEDS_REVIEW,
        VerificationStatus.VERIFIED_AI,
    ):
        raise ValueError("no AI result to accept")
    result = VerificationResult.model_validate(guest.verification_result)
    values = GuestWrite.model_validate(guest, from_attributes=True).model_dump()
    for field in accepted:
        if field == "salutation":
            values["salutation"] = result.salutation
        elif (check := result.fields.get(field)) and check.suggestion is not None:
            values[field] = check.suggestion
    valid = GuestWrite.model_validate(values)
    for field, value in valid.model_dump().items():
        setattr(guest, field, value)
    guest.declension = guest_declension(guest.full_name, guest.position, guest.institution)
    guest.verification_status = VerificationStatus.VERIFIED_AI
    guest.verified_at = datetime.now(UTC)
