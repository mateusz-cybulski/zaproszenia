import io
from dataclasses import dataclass

from pypdf import PdfReader, PdfWriter
from pypdf.errors import PdfReadError

from app.schemas.templates import MAX_PAGES

POINTS_PER_MM = 72 / 25.4


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
