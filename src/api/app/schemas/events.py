from datetime import datetime
from typing import Annotated, Self
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import AfterValidator, Field, model_validator

from app.models import DEFAULT_TIMEZONE
from app.schemas.common import AddressRead, AddressWrite, Text300, Text5000


def _known_timezone(value: str) -> str:
    try:
        ZoneInfo(value)
    except ZoneInfoNotFoundError, ValueError:
        raise ValueError("Nieznana strefa czasowa.") from None
    return value


Name = Annotated[str, Field(min_length=1, max_length=300)]
Timezone = Annotated[str, Field(max_length=64), AfterValidator(_known_timezone)]


class EventWrite(AddressWrite):
    name: Name
    # A time without an offset is the event's local time, as typed in a date-time input.
    starts_at: datetime
    timezone: Timezone = DEFAULT_TIMEZONE
    venue_name: Text300 = None
    invitation_text: Text5000 = None
    # Left out on create: the system template of that kind.
    invitation_template_id: int | None = None
    envelope_template_id: int | None = None

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
