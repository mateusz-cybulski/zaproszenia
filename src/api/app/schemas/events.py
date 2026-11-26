from datetime import datetime
from typing import Annotated, Self
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import AfterValidator, BaseModel, Field, model_validator

from app.models import DEFAULT_TIMEZONE, TextLimit
from app.schemas.common import AddressRead, AddressWrite, TextField


def _known_timezone(value: str) -> str:
    try:
        ZoneInfo(value)
    except ZoneInfoNotFoundError, ValueError:
        raise ValueError("Nieznana strefa czasowa.") from None
    return value


Timezone = Annotated[str, Field(max_length=TextLimit.TIMEZONE), AfterValidator(_known_timezone)]


class EventTemplates(BaseModel):
    # Left out on create: the system template of that kind.
    invitation_template_id: int | None = None
    envelope_template_id: int | None = None


class EventWrite(AddressWrite, EventTemplates):
    name: TextField.Short
    # A time without an offset is the event's local time, as typed in a date-time input.
    starts_at: datetime
    timezone: Timezone = DEFAULT_TIMEZONE
    venue_name: TextField.OptionalShort = None
    invitation_text: TextField.OptionalLong = None

    @model_validator(mode="after")
    def _localise_start(self) -> Self:
        if self.starts_at.tzinfo is None:
            self.starts_at = self.starts_at.replace(tzinfo=ZoneInfo(self.timezone))
        return self


class EventRead(AddressRead):
    id: int
    name: str
    starts_at: datetime
    timezone: str
    venue_name: str | None
    invitation_text: str | None
    invitation_template_id: int | None
    envelope_template_id: int | None
    deleted_at: datetime | None
    created_at: datetime
    updated_at: datetime


class EventListItem(EventRead):
    guest_count: int


class EventReadiness(BaseModel):
    """What the event's documents still lack; the dialog warns about each."""

    guests: int
    unverified: int
    without_address: int
    invitation_template: bool
    envelope_template: bool
    sender_complete: bool
