from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import InvitationStatus
from app.schemas.guests import GuestRead
from app.services.guests import SEARCH_MAX_LENGTH

MAX_GUESTS_PER_REQUEST = 1000


class EventGuestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    guest: GuestRead
    status: InvitationStatus
    added_at: datetime
    generated_at: datetime | None


class EventGuestsAdd(BaseModel):
    guest_ids: list[int] = Field(min_length=1, max_length=MAX_GUESTS_PER_REQUEST)


class EventGuestsAddMatching(BaseModel):
    # The same search as the guest list; None adds every active guest not on the list yet.
    q: str | None = Field(default=None, max_length=SEARCH_MAX_LENGTH)


class EventGuestsAddResult(BaseModel):
    added: int
    already_present: int
    # Ids that are not the user's active guests: missing, someone else's or deleted.
    not_found: list[int]


class EventGuestUpdate(BaseModel):
    status: InvitationStatus
