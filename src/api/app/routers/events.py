import asyncio
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Query, Response, status
from fastapi.exceptions import RequestValidationError
from sqlalchemy import select

from app.auth import CurrentUser
from app.db import Session
from app.dependencies import OwnEvent, Pagination, find_own_event, find_visible_template
from app.models import Event, Profile, Template, TemplateKind
from app.schemas.events import EventRead, EventTemplates, EventWrite
from app.schemas.pagination import Page
from app.schemas.templates import MAX_PAGES
from app.services.pagination import paginate
from app.services.pdf import render, render_png
from app.services.placeholders import event_preview_values
from app.services.templates import base_pdf
from app.storage import FileStorage

router = APIRouter(prefix="/events", tags=["events"])

PNG_RESPONSE: dict[int | str, dict[str, Any]] = {200: {"content": {"image/png": {}}}}

TEMPLATE_FIELDS = {
    "invitation_template_id": TemplateKind.INVITATION,
    "envelope_template_id": TemplateKind.ENVELOPE,
}


async def _check_templates(session: Session, payload: EventTemplates, owner_uid: str) -> None:
    errors = []
    for field, kind in TEMPLATE_FIELDS.items():
        template_id = getattr(payload, field)
        if template_id is None:
            continue
        template = await session.get(Template, template_id)
        if template is None or template.owner_uid not in (None, owner_uid) or template.kind != kind:
            errors.append(
                {
                    "type": "value_error",
                    "loc": ("body", field),
                    "msg": "Wybierz szablon z listy.",
                    "input": template_id,
                }
            )
    if errors:
        raise RequestValidationError(errors)


async def _system_template_id(session: Session, kind: TemplateKind) -> int | None:
    statement = (
        select(Template.id)
        .where(Template.owner_uid.is_(None), Template.kind == kind)
        .order_by(Template.id)
        .limit(1)
    )
    return await session.scalar(statement)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_event(payload: EventWrite, session: Session, user: CurrentUser) -> EventRead:
    async with session.begin():
        await _check_templates(session, payload, user.uid)
        values = payload.model_dump()
        for field, kind in TEMPLATE_FIELDS.items():
            if field not in payload.model_fields_set:
                values[field] = await _system_template_id(session, kind)
        event = Event(owner_uid=user.uid, **values)
        session.add(event)
    await session.refresh(event)
    return EventRead.model_validate(event)


@router.get("")
async def list_events(
    session: Session, user: CurrentUser, pagination: Pagination, deleted: bool = False
) -> Page[EventRead]:
    statement = select(Event).where(Event.owner_uid == user.uid)
    if deleted:
        statement = statement.where(Event.deleted_at.is_not(None)).order_by(
            Event.deleted_at.desc(), Event.id
        )
    else:
        statement = statement.where(Event.deleted_at.is_(None)).order_by(
            Event.starts_at.desc(), Event.id
        )
    events, total = await paginate(session, statement, pagination)
    return Page[EventRead](
        items=[EventRead.model_validate(event) for event in events],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get("/{event_id}")
async def get_event(event: OwnEvent) -> EventRead:
    return EventRead.model_validate(event)


@router.put("/{event_id}")
async def replace_event(
    event: OwnEvent, payload: EventWrite, session: Session, user: CurrentUser
) -> EventRead:
    await _check_templates(session, payload, user.uid)
    for field, value in payload.model_dump().items():
        setattr(event, field, value)
    await session.commit()
    await session.refresh(event)
    return EventRead.model_validate(event)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int, session: Session, user: CurrentUser, permanent: bool = False
) -> None:
    """Move the event to the deleted list, or with permanent=true remove it for good."""
    async with session.begin():
        if permanent:
            await session.delete(await find_own_event(session, event_id, user.uid, deleted=None))
        else:
            event = await find_own_event(session, event_id, user.uid)
            event.deleted_at = datetime.now(UTC)


@router.post("/{event_id}/restore")
async def restore_event(event_id: int, session: Session, user: CurrentUser) -> EventRead:
    async with session.begin():
        event = await find_own_event(session, event_id, user.uid, deleted=True)
        event.deleted_at = None
    await session.refresh(event)
    return EventRead.model_validate(event)


@router.put("/{event_id}/templates")
async def set_event_templates(
    event: OwnEvent, payload: EventTemplates, session: Session, user: CurrentUser
) -> EventRead:
    """Only the templates, from the event's template section."""
    await _check_templates(session, payload, user.uid)
    event.invitation_template_id = payload.invitation_template_id
    event.envelope_template_id = payload.envelope_template_id
    await session.commit()
    await session.refresh(event)
    return EventRead.model_validate(event)


@router.get("/{event_id}/preview.png", response_class=Response, responses=PNG_RESPONSE)
async def preview_event_page(
    event: OwnEvent,
    template_id: int,
    session: Session,
    user: CurrentUser,
    storage: FileStorage,
    page: Annotated[int, Query(ge=0, lt=MAX_PAGES)] = 0,
) -> Response:
    """A template page filled with this event, its sender and a sample guest.

    The template comes from the query, so a choice can be previewed before it is saved.
    """
    template = await find_visible_template(session, template_id, user.uid)
    if page >= len(template.pages):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Template has no such page")
    values = event_preview_values(event, await session.get(Profile, user.uid))
    rendered = await asyncio.to_thread(
        render, await base_pdf(template, storage), template.fields, values
    )
    png = await asyncio.to_thread(render_png, rendered, page)
    return Response(png, media_type="image/png", headers={"Cache-Control": "no-store"})
