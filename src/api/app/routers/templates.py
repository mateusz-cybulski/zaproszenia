from fastapi import APIRouter, HTTPException, status
from sqlalchemy import or_, select

from app.auth import CurrentUser
from app.db import Session
from app.models import Template, TemplateKind
from app.schemas.common import CASE_LABELS
from app.schemas.templates import (
    CaseRead,
    DateFormatRead,
    DeclinablePlaceholder,
    PlaceholderRead,
    TemplateRead,
    TemplateUpdate,
)
from app.services.placeholders import (
    DATE_FORMATS,
    PLACEHOLDERS,
    SAMPLE_EVENT_START,
    SAMPLE_NOMINATIVE,
    case_example,
)
from app.services.templates import TemplateFieldsError, storage_fields

router = APIRouter(prefix="/templates", tags=["templates"])

COPY_SUFFIX = " (kopia)"


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


@router.get("/{template_id}")
async def get_template(template_id: int, session: Session, user: CurrentUser) -> TemplateRead:
    return TemplateRead.model_validate(await _visible_template(session, template_id, user.uid))


@router.post("/{template_id}/copy", status_code=status.HTTP_201_CREATED)
async def copy_template(template_id: int, session: Session, user: CurrentUser) -> TemplateRead:
    async with session.begin():
        source = await _visible_template(session, template_id, user.uid)
        copy = Template(
            owner_uid=user.uid,
            kind=source.kind,
            name=_copy_name(source.name),
            pages=source.pages,
            fields=source.fields,
        )
        session.add(copy)
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
async def delete_template(template_id: int, session: Session, user: CurrentUser) -> None:
    async with session.begin():
        await session.delete(await _own_template(session, template_id, user.uid))
