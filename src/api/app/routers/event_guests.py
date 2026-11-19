from fastapi import APIRouter, HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import contains_eager

from app.auth import CurrentUser
from app.db import Session
from app.dependencies import OwnEvent
from app.models import EventGuest, Guest
from app.schemas.event_guests import (
    EventGuestRead,
    EventGuestsAdd,
    EventGuestsAddResult,
    EventGuestUpdate,
)

router = APIRouter(prefix="/events/{event_id}/guests", tags=["events"])


def _active_guests_of(event_id: int) -> Select[EventGuest]:
    # A deleted guest drops off every event list and comes back when restored.
    return (
        select(EventGuest)
        .join(EventGuest.guest)
        .options(contains_eager(EventGuest.guest))
        .where(EventGuest.event_id == event_id, Guest.deleted_at.is_(None))
    )


async def _event_guest(session: Session, event_id: int, guest_id: int) -> EventGuest:
    statement = _active_guests_of(event_id).where(EventGuest.guest_id == guest_id)
    event_guest = await session.scalar(statement)
    if event_guest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guest is not on this event's list")
    return event_guest


@router.get("")
async def list_event_guests(event: OwnEvent, session: Session) -> list[EventGuestRead]:
    statement = _active_guests_of(event.id).order_by(Guest.recipient_name, Guest.id)
    event_guests = await session.scalars(statement)
    return [EventGuestRead.model_validate(event_guest) for event_guest in event_guests]


@router.post("")
async def add_event_guests(
    event: OwnEvent, payload: EventGuestsAdd, session: Session, user: CurrentUser
) -> EventGuestsAddResult:
    requested = set(payload.guest_ids)
    found = set(
        await session.scalars(
            select(Guest.id).where(
                Guest.owner_uid == user.uid,
                Guest.deleted_at.is_(None),
                Guest.id.in_(requested),
            )
        )
    )
    present = set(
        await session.scalars(
            select(EventGuest.guest_id).where(
                EventGuest.event_id == event.id, EventGuest.guest_id.in_(found)
            )
        )
    )
    new_ids = found - present
    session.add_all(EventGuest(event_id=event.id, guest_id=guest_id) for guest_id in new_ids)
    await session.commit()
    return EventGuestsAddResult(
        added=len(new_ids), already_present=len(present), not_found=sorted(requested - found)
    )


@router.patch("/{guest_id}")
async def update_event_guest(
    event: OwnEvent, guest_id: int, payload: EventGuestUpdate, session: Session
) -> EventGuestRead:
    event_guest = await _event_guest(session, event.id, guest_id)
    event_guest.status = payload.status
    await session.commit()
    return EventGuestRead.model_validate(event_guest)


@router.delete("/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_event_guest(event: OwnEvent, guest_id: int, session: Session) -> None:
    """Take the guest off this event's list; the guest stays in the guest list."""
    await session.delete(await _event_guest(session, event.id, guest_id))
    await session.commit()
