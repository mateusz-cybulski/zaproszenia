from collections.abc import Sequence

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager

from app.models import EventGuest, Guest


def active_guests_of(event_id: int) -> Select[EventGuest]:
    """The event's list with its guests loaded; a deleted guest drops off every list."""
    return (
        select(EventGuest)
        .join(EventGuest.guest)
        .options(contains_eager(EventGuest.guest))
        .where(EventGuest.event_id == event_id, Guest.deleted_at.is_(None))
    )


def in_list_order(statement: Select[EventGuest]) -> Select[EventGuest]:
    return statement.order_by(Guest.recipient_name, Guest.id)


async def active_guest_counts(session: AsyncSession, event_ids: Sequence[int]) -> dict[int, int]:
    """How many guests are on each event's list, in one query; an event without guests is missing."""
    if not event_ids:
        return {}
    statement = (
        select(EventGuest.event_id, func.count())
        .join(EventGuest.guest)
        .where(EventGuest.event_id.in_(event_ids), Guest.deleted_at.is_(None))
        .group_by(EventGuest.event_id)
    )
    return dict((await session.execute(statement)).tuples().all())
