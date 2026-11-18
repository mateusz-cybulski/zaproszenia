from datetime import datetime
from typing import Annotated, Literal, Self

from pydantic import BaseModel, Field, model_validator

from app.models import VerificationStatus
from app.schemas.common import AddressRead, AddressWrite, ObliqueCase, Text300

Forms = dict[ObliqueCase, Annotated[str, Field(min_length=1, max_length=300)]]

VERIFIED_FIELDS = (
    "full_name",
    "position",
    "institution",
    "salutation",
    "street",
    "postal_code",
    "city",
    "country",
)
DECLINED_FIELDS = ("full_name", "position", "institution")

RECIPIENT_REQUIRED = "Podaj imię i nazwisko albo instytucję (np. redakcję zapraszaną jako całość)."


class Declension(BaseModel):
    full_name: Forms = Field(default_factory=dict)
    position: Forms = Field(default_factory=dict)
    institution: Forms = Field(default_factory=dict)


class FieldCheck(BaseModel):
    status: Literal["ok", "warning", "error"]
    suggestion: str | None = None
    explanation: str


class VerificationResult(BaseModel):
    checked_at: datetime
    model: str | None = None
    fields: dict[str, FieldCheck] = Field(default_factory=dict)
    salutation: str | None = None
    salutation_explanation: str | None = None
    declension: Declension | None = None
    rule_issues: list[str] = Field(default_factory=list)
    summary: str | None = None
    error: str | None = None


class GuestWrite(AddressWrite):
    full_name: Text300 = None
    position: Text300 = None
    institution: Text300 = None
    salutation: Text300 = None

    @model_validator(mode="after")
    def _require_recipient(self) -> Self:
        if self.full_name is None and self.institution is None:
            raise ValueError(RECIPIENT_REQUIRED)
        return self


class GuestRead(AddressRead):
    id: int
    full_name: str | None
    position: str | None
    institution: str | None
    salutation: str | None
    declension: Declension | None
    verification_status: VerificationStatus
    verification_result: VerificationResult | None
    verified_at: datetime | None
    deleted_at: datetime | None
    created_at: datetime
    updated_at: datetime


class ManualVerification(BaseModel):
    # None: every guest of the user who is not verified yet.
    guest_ids: list[int] | None = Field(default=None, max_length=1000)


class ManualVerificationResult(BaseModel):
    verified: int
