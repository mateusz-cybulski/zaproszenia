import enum
from datetime import datetime
from typing import Final, final

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


@final
class TextLimit:
    """Maximum text lengths, read by both the columns and the request schemas."""

    SHORT: Final = 300  # one line: names, positions, institutions, street, venue
    LONG: Final = 5000  # paragraphs: the invitation text
    CITY: Final = 200
    POSTAL_CODE: Final = 20
    COUNTRY_CODE: Final = 2  # ISO 3166-1 alpha-2
    TEMPLATE_NAME: Final = 200
    TIMEZONE: Final = 64
    USER_ID: Final = 128  # Identity Platform uid


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


def str_enum[E: enum.StrEnum](enum_cls: type[E]) -> Enum:
    # Plain text instead of a Postgres enum type: adding a value needs no type migration.
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
    street: Mapped[str | None] = mapped_column(String(TextLimit.SHORT))
    postal_code: Mapped[str | None] = mapped_column(String(TextLimit.POSTAL_CODE))
    city: Mapped[str | None] = mapped_column(String(TextLimit.CITY))
    country: Mapped[str] = mapped_column(String(TextLimit.COUNTRY_CODE), default="PL")
