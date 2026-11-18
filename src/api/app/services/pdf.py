import io
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pypdfium2 as pdfium
from pypdf import PdfReader, PdfWriter
from pypdf.errors import PdfReadError
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

from app.schemas.templates import MAX_PAGES, FontName
from app.services.placeholders import field_values, fill

POINTS_PER_MM = 72 / 25.4
PREVIEW_WIDTH_PX = 1000
# Where the first baseline sits below the top of a field, as a share of the font size.
FIRST_BASELINE = 0.85

FONTS_DIR = Path(__file__).resolve().parent.parent / "fonts"
FONTS: dict[FontName, tuple[str, str]] = {
    "serif": ("ZaproszeniaSerif", "DejaVuSerif.ttf"),
    "serif-bold": ("ZaproszeniaSerifBold", "DejaVuSerif-Bold.ttf"),
    "serif-italic": ("ZaproszeniaSerifItalic", "DejaVuSerif-Italic.ttf"),
    "sans": ("ZaproszeniaSans", "DejaVuSans.ttf"),
    "sans-bold": ("ZaproszeniaSansBold", "DejaVuSans-Bold.ttf"),
}
for font_name, filename in FONTS.values():
    pdfmetrics.registerFont(TTFont(font_name, str(FONTS_DIR / filename)))

# PDFium is not thread-safe, and rendering runs in worker threads.
_pdfium_lock = threading.Lock()


class PdfFileError(ValueError):
    pass


@dataclass(frozen=True)
class InspectedPdf:
    data: bytes
    pages: list[dict[str, float]]


def inspect_pdf(data: bytes) -> InspectedPdf:
    """Check an uploaded PDF and return it with page rotation applied and page sizes in mm."""
    try:
        reader = PdfReader(io.BytesIO(data))
        if reader.is_encrypted and not reader.decrypt(""):
            raise PdfFileError("PDF jest zabezpieczony hasłem.")
        page_count = len(reader.pages)
        writer = PdfWriter(clone_from=reader)
    except PdfFileError:
        raise
    # pypdf reports a damaged file through several exception types, not only PdfReadError.
    except (PdfReadError, ValueError, KeyError, TypeError, AttributeError) as error:
        raise PdfFileError("To nie jest poprawny plik PDF.") from error
    if page_count == 0:
        raise PdfFileError("PDF nie ma stron.")
    if page_count > MAX_PAGES:
        raise PdfFileError(f"Szablon może mieć najwyżej {MAX_PAGES} strony.")

    pages = []
    for page in writer.pages:
        # Field positions are measured on the page as displayed, so the rotation goes into content.
        page.transfer_rotation_to_content()
        box = page.cropbox
        pages.append(
            {
                "width_mm": round(float(box.width) / POINTS_PER_MM, 2),
                "height_mm": round(float(box.height) / POINTS_PER_MM, 2),
            }
        )
    output = io.BytesIO()
    writer.write(output)
    return InspectedPdf(output.getvalue(), pages)


def blank_pdf(pages: list[dict[str, float]]) -> bytes:
    writer = PdfWriter()
    for page in pages:
        writer.add_blank_page(
            width=page["width_mm"] * POINTS_PER_MM, height=page["height_mm"] * POINTS_PER_MM
        )
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


def _wrap(text: str, font: str, size: float, width: float) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        current = ""
        for word in paragraph.split(" "):
            candidate = f"{current} {word}" if current else word
            if current and pdfmetrics.stringWidth(candidate, font, size) > width:
                lines.append(current)
                current = word
            else:
                current = candidate
        lines.append(current)
    return lines


def _draw_field(canvas: Canvas, field: dict[str, Any], text: str, left: float, top: float) -> None:
    font, _ = FONTS[field["font"]]
    size = float(field["font_size"])
    width = field["width_mm"] * POINTS_PER_MM
    x = left + field["x_mm"] * POINTS_PER_MM
    y = top - field["y_mm"] * POINTS_PER_MM - size * FIRST_BASELINE
    canvas.setFont(font, size)
    canvas.setFillColor(HexColor(field["color"]))
    for line in _wrap(text, font, size, width):
        if field["align"] == "center":
            canvas.drawCentredString(x + width / 2, y, line)
        elif field["align"] == "right":
            canvas.drawRightString(x + width, y, line)
        else:
            canvas.drawString(x, y, line)
        y -= size * float(field["line_height"])


def render(base_pdf: bytes, fields: list[dict[str, Any]], values: dict[str, str]) -> bytes:
    """Draw the fields, filled with values, over the template pages."""
    writer = PdfWriter(clone_from=PdfReader(io.BytesIO(base_pdf)))
    for page_index, page in enumerate(writer.pages):
        page_fields = [field for field in fields if field["page"] == page_index]
        if not page_fields:
            continue
        crop = page.cropbox
        media = page.mediabox
        overlay = io.BytesIO()
        # Absolute page coordinates, measured from the top left corner of the cropbox.
        canvas = Canvas(overlay, pagesize=(float(media.right), float(media.top)))
        for field in page_fields:
            text = fill(field["content"], field_values(values, field))
            if text.strip():
                _draw_field(canvas, field, text, float(crop.left), float(crop.top))
        canvas.save()
        page.merge_page(PdfReader(io.BytesIO(overlay.getvalue())).pages[0])
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


def render_png(pdf: bytes, page_index: int) -> bytes:
    with _pdfium_lock:
        document = pdfium.PdfDocument(pdf)
        try:
            if page_index >= len(document):
                raise PdfFileError(f"Szablon nie ma strony {page_index + 1}.")
            page = document[page_index]
            image = page.render(scale=PREVIEW_WIDTH_PX / page.get_width()).to_pil()
        finally:
            document.close()
    output = io.BytesIO()
    image.save(output, format="PNG", optimize=True)
    return output.getvalue()
