"""Guests from a spreadsheet: columns matched by their headers, every row checked like the form."""

import unicodedata
from collections.abc import Iterable

from pydantic import ValidationError
from pydantic_core import ErrorDetails
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Guest
from app.schemas.guests import (
    RECIPIENT_REQUIRED,
    GuestImportDuplicate,
    GuestImportResult,
    GuestImportRowError,
    GuestWrite,
)
from app.services.declension import guest_declension
from app.services.spreadsheet import SpreadsheetError

PREVIEW_ROWS = 20

# Header names people use, compared without case, Polish letters and extra spaces.
HEADER_ALIASES: dict[str, tuple[str, ...]] = {
    "full_name": (
        "full name",
        "name",
        "imie i nazwisko",
        "imie nazwisko",
        "nazwisko i imie",
        "tytul imie i nazwisko",
        "gosc",
        "osoba",
        "uczestnik",
    ),
    "position": ("position", "job title", "title", "stanowisko", "funkcja"),
    "institution": (
        "institution",
        "organization",
        "company",
        "instytucja",
        "organizacja",
        "firma",
        "uczelnia",
    ),
    "salutation": ("salutation", "zwrot", "zwrot grzecznosciowy"),
    "street": ("street", "address", "ulica", "ulica i numer", "adres"),
    "postal_code": ("postal code", "zip", "zip code", "kod pocztowy", "kod"),
    "city": ("city", "miasto", "miejscowosc", "poczta"),
    "country": ("country", "kraj"),
}

FIELD_LABELS = {
    "full_name": "Imię i nazwisko",
    "position": "Stanowisko",
    "institution": "Instytucja",
    "salutation": "Zwrot grzecznościowy",
    "street": "Ulica i numer",
    "postal_code": "Kod pocztowy",
    "city": "Miejscowość",
    "country": "Kraj",
}


def normalized_header(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value.replace("ł", "l").replace("Ł", "L"))
    plain = "".join(character for character in decomposed if not unicodedata.combining(character))
    return " ".join(plain.casefold().replace("_", " ").split())


FIELD_BY_HEADER = {
    normalized_header(alias): field
    for field, aliases in HEADER_ALIASES.items()
    for alias in aliases
}


def duplicate_key(full_name: str | None, institution: str | None) -> tuple[str, str]:
    def plain(value: str | None) -> str:
        return " ".join((value or "").split()).casefold()

    return plain(full_name), plain(institution)


def _message(error: ErrorDetails) -> str:
    """One validation error in Polish, named by the form's label."""
    field = str(error["loc"][0]) if error["loc"] else ""
    label = FIELD_LABELS.get(field, "")
    kind = error["type"]
    if kind in ("missing", "string_too_short"):
        return f"{label}: brak wartości."
    if kind == "string_too_long":
        return f"{label}: za długie (najwyżej {error.get('ctx', {}).get('max_length')} znaków)."
    if field == "country":
        return "Kraj: dwuliterowy kod kraju, np. PL."
    if not field and RECIPIENT_REQUIRED in error["msg"]:
        return RECIPIENT_REQUIRED
    return f"{label}: {error['msg']}." if label else str(error["msg"])


async def import_guests(
    session: AsyncSession,
    owner_uid: str,
    rows: Iterable[list[str]],
    *,
    dry_run: bool,
    max_rows: int,
) -> GuestImportResult:
    """Checks every row and, unless dry_run, saves the valid ones that are not duplicates.

    Raises SpreadsheetError when the file has no header, no known column or too many rows.
    """
    iterator = iter(rows)
    header = next(iterator, None)
    if not header:
        raise SpreadsheetError("Plik jest pusty: pierwszy wiersz ma zawierać nagłówki kolumn.")
    columns = {
        index: FIELD_BY_HEADER.get(normalized_header(name)) for index, name in enumerate(header)
    }
    mapped = {header[index]: field for index, field in columns.items() if field}
    if not mapped:
        raise SpreadsheetError(
            "Nie rozpoznano żadnej kolumny. Nazwij nagłówki np. „Imię i nazwisko”, „Instytucja”, "
            "„Ulica i numer”, „Kod pocztowy”, „Miejscowość”."
        )

    async with session.begin():
        existing = await session.execute(
            select(Guest.full_name, Guest.institution).where(
                Guest.owner_uid == owner_uid, Guest.deleted_at.is_(None)
            )
        )
        seen = {duplicate_key(full_name, institution) for full_name, institution in existing}

    valid: list[GuestWrite] = []
    errors: list[GuestImportRowError] = []
    duplicates: list[GuestImportDuplicate] = []
    total = 0
    # Row numbers as in the spreadsheet: the header is row 1.
    for row_number, row in enumerate(iterator, start=2):
        if not any(cell.strip() for cell in row):
            continue
        total += 1
        if total > max_rows:
            raise SpreadsheetError(f"Plik ma więcej niż {max_rows} gości: podziel go na części.")
        values = {
            field: row[index] for index, field in columns.items() if field and index < len(row)
        }
        try:
            guest = GuestWrite.model_validate(values)
        except ValidationError as error:
            errors.append(
                GuestImportRowError(
                    row=row_number, errors=[_message(detail) for detail in error.errors()]
                )
            )
            continue
        key = duplicate_key(guest.full_name, guest.institution)
        if key in seen:
            duplicates.append(
                GuestImportDuplicate(
                    row=row_number, full_name=guest.full_name, institution=guest.institution
                )
            )
            continue
        seen.add(key)
        valid.append(guest)

    if not dry_run and valid:
        async with session.begin():
            for guest in valid:
                session.add(
                    Guest(
                        owner_uid=owner_uid,
                        **guest.model_dump(),
                        declension=guest_declension(
                            guest.full_name, guest.position, guest.institution
                        ),
                    )
                )

    return GuestImportResult(
        dry_run=dry_run,
        total_rows=total,
        created=0 if dry_run else len(valid),
        ready=len(valid),
        duplicates=duplicates,
        errors=errors,
        mapped_columns=mapped,
        unmapped_columns=[
            name for index, name in enumerate(header) if not columns[index] and name.strip()
        ],
        preview=valid[:PREVIEW_ROWS],
    )
