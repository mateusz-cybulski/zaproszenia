import enum
from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, ColumnElement, DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import AddressMixin, Base, TextLimit, TimestampMixin, str_enum


class VerificationStatus(enum.StrEnum):
    PENDING = "pending"
    VERIFIED_AI = "verified_ai"  # AI raised no issues, or the user accepted its result
    VERIFIED_MANUAL = "verified_manual"
    NEEDS_REVIEW = "needs_review"
    FAILED = "failed"


VERIFIED_STATUSES = frozenset({VerificationStatus.VERIFIED_AI, VerificationStatus.VERIFIED_MANUAL})


class Guest(TimestampMixin, AddressMixin, Base):
    __tablename__ = "guests"
    __table_args__ = (
        CheckConstraint(
            "full_name IS NOT NULL OR institution IS NOT NULL", name="recipient_present"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_uid: Mapped[str] = mapped_column(String(TextLimit.USER_ID), index=True)
    full_name: Mapped[str | None] = mapped_column(String(TextLimit.SHORT))
    position: Mapped[str | None] = mapped_column(String(TextLimit.SHORT))
    institution: Mapped[str | None] = mapped_column(String(TextLimit.SHORT))
    salutation: Mapped[str | None] = mapped_column(String(TextLimit.SHORT))
    declension: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        str_enum(VerificationStatus), default=VerificationStatus.PENDING
    )
    verification_result: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Set when the guest is moved to the deleted list; NULL for active guests.
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    @hybrid_property
    def recipient_name(self) -> str:
        return self.full_name or self.institution or ""

    @recipient_name.inplace.expression
    @classmethod
    def _recipient_name_expression(cls) -> ColumnElement[str]:
        return func.coalesce(cls.full_name, cls.institution)
