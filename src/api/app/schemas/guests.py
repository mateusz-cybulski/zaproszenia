from datetime import datetime
from typing import Annotated, Literal, Self

from pydantic import BaseModel, Field, model_validator

from app.models import TextLimit, VerificationStatus
from app.schemas.common import AddressRead, AddressWrite, ObliqueCase, TextField

Forms = dict[ObliqueCase, Annotated[str, Field(min_length=1, max_length=TextLimit.SHORT)]]

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


class AddressCheck(BaseModel):
    status: Literal["ok", "warning", "error", "skipped"]
    explanation: str
    suggested_postal_code: str | None = None
    suggested_city: str | None = None
    matched_label: str | None = None


class VerificationResult(BaseModel):
    checked_at: datetime
    model: str | None = None
    fields: dict[str, FieldCheck] = Field(default_factory=dict)
    salutation: str | None = None
    salutation_explanation: str | None = None
    declension: Declension | None = None
    rule_issues: list[str] = Field(default_factory=list)
    address_check: AddressCheck | None = None
    summary: str | None = None
    error: str | None = None


class GuestWrite(AddressWrite):
    # An envelope cannot be printed without them; the sender and events keep them optional.
    street: TextField.Short
    postal_code: TextField.PostalCode
    city: TextField.City
    full_name: TextField.OptionalShort = None
    position: TextField.OptionalShort = None
    institution: TextField.OptionalShort = None
    salutation: TextField.OptionalShort = None

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


AcceptedField = Literal[
    "full_name", "position", "institution", "street", "postal_code", "city", "salutation"
]


class AiVerificationAccept(BaseModel):
    # The fields whose suggestion the user takes; the rest keep their current values.
    accept: list[AcceptedField] = Field(default_factory=list, max_length=7)


class VerificationQueue(BaseModel):
    guest_ids: list[int]


class GuestImportRowError(BaseModel):
    row: int
    errors: list[str]


class GuestImportDuplicate(BaseModel):
    row: int
    full_name: str | None
    institution: str | None


class GuestImportResult(BaseModel):
    dry_run: bool
    # Rows with data (blank rows are skipped); ready = valid and not duplicates; created = saved.
    total_rows: int
    ready: int
    created: int
    duplicates: list[GuestImportDuplicate]
    errors: list[GuestImportRowError]
    # File header -> guest field, and the headers no field matched.
    mapped_columns: dict[str, str]
    unmapped_columns: list[str]
    preview: list[GuestWrite]
