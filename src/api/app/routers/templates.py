import asyncio
from typing import Annotated, Any

from fastapi import APIRouter, File, Form, HTTPException, Query, Response, UploadFile, status
from sqlalchemy import or_, select

from app.auth import CurrentUser
from app.db import Session
from app.models import Template, TemplateKind
from app.schemas.common import CASE_LABELS
from app.schemas.templates import (
    MAX_PAGES,
    CaseRead,
    DateFormatRead,
    DeclinablePlaceholder,
    PlaceholderRead,
    TemplateName,
    TemplatePreview,
    TemplateRead,
    TemplateUpdate,
)
from app.services.pdf import PdfFileError, inspect_pdf, render, render_png
from app.services.placeholders import (
    DATE_FORMATS,
    PLACEHOLDERS,
    SAMPLE_EVENT_START,
    SAMPLE_NOMINATIVE,
    case_example,
    sample_values,
)
from app.services.templates import (
    TemplateFieldsError,
    base_pdf,
    create_with_file,
    default_fields,
    storage_fields,
)
from app.storage import FileStorage

router = APIRouter(prefix="/templates", tags=["templates"])

PDF_RESPONSE: dict[int | str, dict[str, Any]] = {200: {"content": {"application/pdf": {}}}}
PNG_RESPONSE: dict[int | str, dict[str, Any]] = {200: {"content": {"image/png": {}}}}
COPY_SUFFIX = " (kopia)"
MAX_PDF_BYTES = 15 * 1024 * 1024


async def _visible_template(session: Session, template_id: int, owner_uid: str) -> Template:
    template = await session.get(Template, template_id)
    if template is None or template.owner_uid not in (None, owner_uid):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Template not found")
    return template


async def _own_template(session: Session, template_id: int, owner_uid: str) -> Template:
    template = await _visible_template(session, template_id, owner_uid)
    if template.is_system:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "System templates are read-only; copy the template first"
        )
    return template


def _copy_name(name: str) -> str:
    return name[: 200 - len(COPY_SUFFIX)] + COPY_SUFFIX


@router.get("")
async def list_templates(
    session: Session, user: CurrentUser, kind: TemplateKind | None = None
) -> list[TemplateRead]:
    statement = (
        select(Template)
        .where(or_(Template.owner_uid.is_(None), Template.owner_uid == user.uid))
        .order_by(Template.owner_uid.is_not(None), Template.name, Template.id)
    )
    if kind:
        statement = statement.where(Template.kind == kind)
    return [TemplateRead.model_validate(template) for template in await session.scalars(statement)]


@router.get("/placeholders")
async def list_placeholders() -> list[PlaceholderRead]:
    return [PlaceholderRead.model_validate(placeholder) for placeholder in PLACEHOLDERS]


@router.get("/date-formats")
async def list_date_formats() -> list[DateFormatRead]:
    return [
        DateFormatRead(value=value, example=formatter(SAMPLE_EVENT_START))
        for value, formatter in DATE_FORMATS.items()
    ]


@router.get("/cases")
async def list_cases() -> list[CaseRead]:
    names: list[DeclinablePlaceholder] = list(SAMPLE_NOMINATIVE)
    return [
        CaseRead(
            value=case, label=label, examples={name: case_example(name, case) for name in names}
        )
        for case, label in CASE_LABELS.items()
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_template(
    session: Session,
    user: CurrentUser,
    storage: FileStorage,
    name: Annotated[TemplateName, Form()],
    kind: Annotated[TemplateKind, Form()],
    file: Annotated[
        UploadFile, File(description="PDF of an invitation or envelope, up to 4 pages")
    ],
) -> TemplateRead:
    data = await file.read(MAX_PDF_BYTES + 1)
    if len(data) > MAX_PDF_BYTES:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE, "Plik jest za duży (najwyżej 15 MB)."
        )
    try:
        pdf = await asyncio.to_thread(inspect_pdf, data)
    except PdfFileError as error:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(error)) from error
    template = Template(
        owner_uid=user.uid,
        kind=kind,
        name=name,
        pages=pdf.pages,
        fields=default_fields(kind, pdf.pages),
    )
    await create_with_file(session, storage, template, pdf.data)
    await session.refresh(template)
    return TemplateRead.model_validate(template)


@router.get("/{template_id}")
async def get_template(template_id: int, session: Session, user: CurrentUser) -> TemplateRead:
    return TemplateRead.model_validate(await _visible_template(session, template_id, user.uid))


@router.get("/{template_id}/file", response_class=Response, responses=PDF_RESPONSE)
async def template_file(
    template_id: int, session: Session, user: CurrentUser, storage: FileStorage
) -> Response:
    template = await _visible_template(session, template_id, user.uid)
    if template.pdf_key is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Template has no file")
    return Response(await storage.get(template.pdf_key), media_type="application/pdf")


@router.get("/{template_id}/preview", response_class=Response, responses=PDF_RESPONSE)
async def preview_template(
    template_id: int, session: Session, user: CurrentUser, storage: FileStorage
) -> Response:
    """The saved template filled with sample data."""
    template = await _visible_template(session, template_id, user.uid)
    pdf = await base_pdf(template, storage)
    rendered = await asyncio.to_thread(render, pdf, template.fields, sample_values())
    return Response(rendered, media_type="application/pdf")


@router.post("/{template_id}/preview.png", response_class=Response, responses=PNG_RESPONSE)
async def preview_image(
    template_id: int,
    payload: TemplatePreview,
    session: Session,
    user: CurrentUser,
    storage: FileStorage,
) -> Response:
    """One page with unsaved fields from the editor, filled with sample data."""
    template = await _visible_template(session, template_id, user.uid)
    try:
        fields = storage_fields(payload.fields, template.pages)
        if payload.page >= len(template.pages):
            raise TemplateFieldsError(f"Szablon nie ma strony {payload.page + 1}.")
    except TemplateFieldsError as error:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(error)) from error
    pdf = await base_pdf(template, storage)
    rendered = await asyncio.to_thread(render, pdf, fields, sample_values())
    png = await asyncio.to_thread(render_png, rendered, payload.page)
    return Response(png, media_type="image/png", headers={"Cache-Control": "no-store"})


@router.get("/{template_id}/page.png", response_class=Response, responses=PNG_RESPONSE)
async def page_image(
    template_id: int,
    session: Session,
    user: CurrentUser,
    storage: FileStorage,
    page: Annotated[int, Query(ge=0, lt=MAX_PAGES)] = 0,
) -> Response:
    """A template page without fields, e.g. a thumbnail in the template list."""
    template = await _visible_template(session, template_id, user.uid)
    if page >= len(template.pages):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Template has no such page")
    png = await asyncio.to_thread(render_png, await base_pdf(template, storage), page)
    return Response(png, media_type="image/png")


@router.post("/{template_id}/copy", status_code=status.HTTP_201_CREATED)
async def copy_template(
    template_id: int, session: Session, user: CurrentUser, storage: FileStorage
) -> TemplateRead:
    source = await _visible_template(session, template_id, user.uid)
    pdf = await storage.get(source.pdf_key) if source.pdf_key else None
    copy = Template(
        owner_uid=user.uid,
        kind=source.kind,
        name=_copy_name(source.name),
        pages=source.pages,
        fields=source.fields,
    )
    await create_with_file(session, storage, copy, pdf)
    await session.refresh(copy)
    return TemplateRead.model_validate(copy)


@router.patch("/{template_id}")
async def update_template(
    template_id: int, payload: TemplateUpdate, session: Session, user: CurrentUser
) -> TemplateRead:
    async with session.begin():
        template = await _own_template(session, template_id, user.uid)
        if payload.name is not None:
            template.name = payload.name
        if payload.fields is not None:
            try:
                template.fields = storage_fields(payload.fields, template.pages)
            except TemplateFieldsError as error:
                raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(error)) from error
    await session.refresh(template)
    return TemplateRead.model_validate(template)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int, session: Session, user: CurrentUser, storage: FileStorage
) -> None:
    async with session.begin():
        template = await _own_template(session, template_id, user.uid)
        pdf_key = template.pdf_key
        await session.delete(template)
    if pdf_key:
        await storage.delete(pdf_key)
