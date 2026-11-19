from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import AddressMixin, Base, TimestampMixin

DEFAULT_TIMEZONE = "Europe/Warsaw"


class Event(TimestampMixin, AddressMixin, Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_uid: Mapped[str] = mapped_column(String(128), index=True)
    name: Mapped[str] = mapped_column(String(300))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # The event's own zone: the date and time on invitations are its wall-clock time.
    timezone: Mapped[str] = mapped_column(String(64), default=DEFAULT_TIMEZONE)
    venue_name: Mapped[str | None] = mapped_column(String(300))
    invitation_text: Mapped[str | None] = mapped_column(Text)
    invitation_template_id: Mapped[int | None] = mapped_column(
        ForeignKey("templates.id", ondelete="SET NULL")
    )
    envelope_template_id: Mapped[int | None] = mapped_column(
        ForeignKey("templates.id", ondelete="SET NULL")
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
