from datetime import UTC, datetime

from fastapi import APIRouter, status
from fastapi.exceptions import RequestValidationError
from sqlalchemy import select

from app.auth import CurrentUser
from app.db import Session
from app.dependencies import OwnEvent, find_own_event
from app.models import Event, Template, TemplateKind
from app.schemas.events import EventRead, EventWrite

router = APIRouter(prefix="/events", tags=["events"])

TEMPLATE_FIELDS = {
    "invitation_template_id": TemplateKind.INVITATION,
    "envelope_template_id": TemplateKind.ENVELOPE,
}


async def _check_templates(session: Session, payload: EventWrite, owner_uid: str) -> None:
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
    session: Session, user: CurrentUser, deleted: bool = False
) -> list[EventRead]:
    statement = select(Event).where(Event.owner_uid == user.uid)
    if deleted:
        statement = statement.where(Event.deleted_at.is_not(None)).order_by(
            Event.deleted_at.desc(), Event.id
        )
    else:
        statement = statement.where(Event.deleted_at.is_(None)).order_by(
            Event.starts_at.desc(), Event.id
        )
    events = await session.scalars(statement)
    return [EventRead.model_validate(event) for event in events]


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
