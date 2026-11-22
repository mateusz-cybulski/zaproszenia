from sqlalchemy import Select, select
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
