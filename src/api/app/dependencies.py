from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.auth import CurrentUser
from app.db import Session
from app.models import Event


async def find_own_event(
    session: Session, event_id: int, owner_uid: str, *, deleted: bool | None = False
) -> Event:
    """The user's event, active by default; deleted=True for deleted ones, None for either."""
    # Someone else's event looks exactly like a missing one: no hint that the id exists.
    event = await session.get(Event, event_id)
    if event is None or event.owner_uid != owner_uid:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    if deleted is not None and (event.deleted_at is not None) != deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    return event


async def _active_own_event(event_id: int, session: Session, user: CurrentUser) -> Event:
    return await find_own_event(session, event_id, user.uid)


# The user's active event from the {event_id} path parameter, or 404.
OwnEvent = Annotated[Event, Depends(_active_own_event)]
