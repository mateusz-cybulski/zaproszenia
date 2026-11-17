import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, MetaData, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Explicit constraint names keep Alembic autogenerate stable across databases.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


def str_enum[E: enum.StrEnum](enum_cls: type[E]) -> Enum:
    """Enum stored as plain text with the members' values (not names).

    Adding a value then needs no Postgres type migration.
    """
    return Enum(
        enum_cls,
        native_enum=False,
        length=32,
        values_callable=lambda members: [member.value for member in members],
        validate_strings=True,
    )


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # Set by the database on every ORM update; refresh the object before reading it back.
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class AddressMixin:
    """Postal address; every part is optional until something is actually sent by post."""

    street: Mapped[str | None] = mapped_column(String(300))
    postal_code: Mapped[str | None] = mapped_column(String(20))
    city: Mapped[str | None] = mapped_column(String(200))
    country: Mapped[str] = mapped_column(String(2), default="PL")  # ISO 3166-1 alpha-2
