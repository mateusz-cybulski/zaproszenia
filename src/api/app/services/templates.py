from dataclasses import dataclass
from typing import Any

from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Template, TemplateKind
from app.schemas.templates import TemplateField
from app.services.placeholders import to_storage, unknown_placeholders
from app.storage import Storage

# A field may end this far past the right edge, so a box drawn up to the edge is not rejected.
EDGE_TOLERANCE_MM = 0.5


class TemplateFieldsError(ValueError):
    pass


@dataclass(frozen=True)
class SystemTemplate:
    key: str
    kind: TemplateKind
    name: str
    width_mm: float
    height_mm: float


SYSTEM_TEMPLATES = (
    SystemTemplate("invitation_a5_blank", TemplateKind.INVITATION, "Pusta karta A5", 148, 210),
    SystemTemplate("envelope_dl_blank", TemplateKind.ENVELOPE, "Koperta DL z okienkiem", 220, 110),
)


def _field(
    field_id: str,
    page: dict[str, float],
    left: float,
    top: float,
    width: float,
    content: str,
    font: str,
    font_size: float,
    align: str = "center",
) -> dict[str, Any]:
    # Position and width as fractions of the page, so the layout fits any paper size.
    return TemplateField.model_validate(
        {
            "id": field_id,
            "x_mm": round(page["width_mm"] * left, 1),
            "y_mm": round(page["height_mm"] * top, 1),
            "width_mm": round(page["width_mm"] * width, 1),
            "content": content,
            "font": font,
            "font_size": font_size,
            "align": align,
        }
    ).model_dump()


def default_fields(kind: TemplateKind, pages: list[dict[str, float]]) -> list[dict[str, Any]]:
    page = pages[0]
    if kind == TemplateKind.ENVELOPE:
        return [
            _field(
                "sender",
                page,
                0.05,
                0.09,
                0.4,
                "{sender_name}\n{sender_address}",
                "sans",
                8,
                "left",
            ),
            _field("recipient", page, 0.52, 0.45, 0.43, "{recipient_block}", "sans", 11, "left"),
        ]
    return [
        _field("salutation", page, 0.1, 0.28, 0.8, "{salutation},", "serif-italic", 13),
        _field("text", page, 0.1, 0.36, 0.8, "{invitation_text}", "serif", 12),
        _field("event", page, 0.06, 0.47, 0.88, "{event_name}", "serif-bold", 20),
        _field(
            "when",
            page,
            0.1,
            0.57,
            0.8,
            "{event_weekday}, {event_date}\ngodz. {event_time}",
            "serif",
            12,
        ),
        _field("where", page, 0.1, 0.68, 0.8, "{venue}\n{event_address}", "serif", 11),
        _field("signature", page, 0.1, 0.86, 0.8, "{sender_name}", "serif-italic", 11),
    ]


async def ensure_system_templates(session: AsyncSession) -> None:
    rows = []
    for spec in SYSTEM_TEMPLATES:
        pages = [{"width_mm": spec.width_mm, "height_mm": spec.height_mm}]
        rows.append(
            {
                "system_key": spec.key,
                "kind": spec.kind,
                "name": spec.name,
                "pages": pages,
                "fields": default_fields(spec.kind, pages),
            }
        )
    # An upsert, because every API instance runs this on startup, possibly at the same time.
    statement = insert(Template).values(rows)
    statement = statement.on_conflict_do_update(
        index_elements=[Template.system_key],
        set_={column: statement.excluded[column] for column in ("kind", "name", "pages", "fields")},
    )
    await session.execute(statement)
    await session.execute(
        delete(Template).where(
            Template.system_key.is_not(None),
            Template.system_key.not_in([spec.key for spec in SYSTEM_TEMPLATES]),
        )
    )


def storage_fields(
    fields: list[TemplateField], pages: list[dict[str, float]]
) -> list[dict[str, Any]]:
    """Validate fields against the template's pages and return them as stored."""
    stored = []
    for index, field in enumerate(fields, start=1):
        content = to_storage(field.content)
        unknown = unknown_placeholders(content)
        if unknown:
            names = ", ".join("{" + name + "}" for name in sorted(unknown))
            raise TemplateFieldsError(
                f"Pole {index}: nie ma takich danych: {names}. Wstaw je przyciskiem z listy."
            )
        if field.page >= len(pages):
            raise TemplateFieldsError(f"Pole {index}: szablon nie ma strony {field.page + 1}.")
        page = pages[field.page]
        if (
            field.x_mm + field.width_mm > page["width_mm"] + EDGE_TOLERANCE_MM
            or field.y_mm > page["height_mm"]
        ):
            raise TemplateFieldsError(f"Pole {index} wychodzi poza stronę.")
        stored.append({**field.model_dump(), "content": content})
    return stored


async def create_with_file(
    session: AsyncSession, storage: Storage, template: Template, pdf: bytes | None
) -> None:
    """Insert the template and store its PDF under a key built from the new id."""
    session.add(template)
    await session.flush()
    if pdf is not None:
        template.pdf_key = template.storage_key()
        await storage.put(template.pdf_key, pdf, "application/pdf")
    try:
        await session.commit()
    except BaseException:
        if template.pdf_key:
            await storage.delete(template.pdf_key)
        raise
