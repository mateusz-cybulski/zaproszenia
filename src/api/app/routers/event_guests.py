from fastapi import APIRouter, HTTPException, status
from sqlalchemy import literal, select
from sqlalchemy.dialects.postgresql import insert

from app.auth import CurrentUser
from app.db import Session
from app.dependencies import OwnEvent, Pagination
from app.models import EventGuest, Guest
from app.schemas.event_guests import (
    EventGuestRead,
    EventGuestsAdd,
    EventGuestsAddMatching,
    EventGuestsAddResult,
    EventGuestUpdate,
)
from app.schemas.pagination import Page
from app.services.event_guests import active_guests_of, in_list_order
from app.services.guests import guest_search
from app.services.pagination import paginate

router = APIRouter(prefix="/events/{event_id}/guests", tags=["events"])


async def _event_guest(session: Session, event_id: int, guest_id: int) -> EventGuest:
    statement = active_guests_of(event_id).where(EventGuest.guest_id == guest_id)
    event_guest = await session.scalar(statement)
    if event_guest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guest is not on this event's list")
    return event_guest


@router.get("")
async def list_event_guests(
    event: OwnEvent, session: Session, pagination: Pagination
) -> Page[EventGuestRead]:
    statement = in_list_order(active_guests_of(event.id))
    event_guests, total = await paginate(session, statement, pagination)
    return Page[EventGuestRead](
        items=[EventGuestRead.model_validate(event_guest) for event_guest in event_guests],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
    )


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
    # A guest added meanwhile (e.g. from another tab) counts as already present, not as an error.
    added: set[int] = set()
    if found:
        added = set(
            await session.scalars(
                insert(EventGuest)
                .values([{"event_id": event.id, "guest_id": guest_id} for guest_id in found])
                .on_conflict_do_nothing()
                .returning(EventGuest.guest_id)
            )
        )
    await session.commit()
    return EventGuestsAddResult(
        added=len(added), already_present=len(found - added), not_found=sorted(requested - found)
    )


@router.post("/matching")
async def add_matching_event_guests(
    event: OwnEvent, payload: EventGuestsAddMatching, session: Session, user: CurrentUser
) -> EventGuestsAddResult:
    """Every active guest that matches the search and is not on the list yet, in one statement."""
    on_list = select(EventGuest.guest_id).where(EventGuest.event_id == event.id)
    candidates = select(literal(event.id), Guest.id).where(
        Guest.owner_uid == user.uid,
        Guest.deleted_at.is_(None),
        Guest.id.not_in(on_list),
    )
    if payload.q and payload.q.strip():
        candidates = candidates.where(guest_search(payload.q))
    added = await session.scalars(
        insert(EventGuest)
        .from_select(["event_id", "guest_id"], candidates)
        .on_conflict_do_nothing()
        .returning(EventGuest.guest_id)
    )
    count = len(added.all())
    await session.commit()
    return EventGuestsAddResult(added=count, already_present=0, not_found=[])


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
