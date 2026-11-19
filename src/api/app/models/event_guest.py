import enum
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, str_enum
from app.models.guest import Guest


class InvitationStatus(enum.StrEnum):
    ADDED = "added"
    GENERATED = "generated"
    SENT = "sent"
    ACCEPTED = "accepted"
    DECLINED = "declined"


class EventGuest(Base):
    """A guest on one event's list, with where their invitation stands."""

    __tablename__ = "event_guests"

    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"), primary_key=True
    )
    guest_id: Mapped[int] = mapped_column(
        ForeignKey("guests.id", ondelete="CASCADE"), primary_key=True, index=True
    )
    status: Mapped[InvitationStatus] = mapped_column(
        str_enum(InvitationStatus), default=InvitationStatus.ADDED
    )
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    guest: Mapped[Guest] = relationship(lazy="raise")
