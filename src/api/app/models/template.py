import enum
from typing import Any

from sqlalchemy import CheckConstraint, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TextLimit, TimestampMixin, str_enum
from app.storage_keys import user_files_prefix


class TemplateKind(enum.StrEnum):
    INVITATION = "invitation"
    ENVELOPE = "envelope"


class Template(TimestampMixin, Base):
    __tablename__ = "templates"
    __table_args__ = (
        CheckConstraint("(owner_uid IS NULL) <> (system_key IS NULL)", name="owner_or_system"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    # NULL for system templates: shared with every user and read-only.
    owner_uid: Mapped[str | None] = mapped_column(String(TextLimit.USER_ID), index=True)
    system_key: Mapped[str | None] = mapped_column(String(100), unique=True)
    kind: Mapped[TemplateKind] = mapped_column(str_enum(TemplateKind))
    name: Mapped[str] = mapped_column(String(TextLimit.TEMPLATE_NAME))
    # NULL for blank templates: their pages are empty sheets of the size in pages.
    pdf_key: Mapped[str | None] = mapped_column(String(500))
    pages: Mapped[list[dict[str, float]]] = mapped_column(JSONB)
    fields: Mapped[list[dict[str, Any]]] = mapped_column(JSONB)

    @property
    def is_system(self) -> bool:
        return self.owner_uid is None

    @property
    def has_file(self) -> bool:
        return self.pdf_key is not None

    def storage_key(self) -> str:
        return f"{user_files_prefix(self.owner_uid or 'system')}templates/{self.id}.pdf"
