from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import AddressMixin, Base, TimestampMixin


class Profile(TimestampMixin, AddressMixin, Base):
    """The user's own data: the sender printed on envelopes and under invitations."""

    __tablename__ = "profiles"

    owner_uid: Mapped[str] = mapped_column(String(128), primary_key=True)
    sender_name: Mapped[str | None] = mapped_column(String(300))
