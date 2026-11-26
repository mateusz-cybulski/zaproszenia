"""What an event still lacks before its invitations and envelopes are printed."""

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import VERIFIED_STATUSES, Event, EventGuest, Guest, Profile
from app.schemas.events import EventReadiness


async def event_readiness(session: AsyncSession, event: Event, owner_uid: str) -> EventReadiness:
    """Counts over the event's active guests in one query, plus the templates and the sender."""
    statement = (
        select(
            func.count(),
            func.count().filter(Guest.verification_status.not_in(VERIFIED_STATUSES)),
            # Guests saved before the address became required: an envelope needs all three.
            func.count().filter(
                or_(Guest.street.is_(None), Guest.postal_code.is_(None), Guest.city.is_(None))
            ),
        )
        .select_from(EventGuest)
        .join(EventGuest.guest)
        .where(EventGuest.event_id == event.id, Guest.deleted_at.is_(None))
    )
    guests, unverified, without_address = (await session.execute(statement)).one()
    profile = await session.get(Profile, owner_uid)
    return EventReadiness(
        guests=guests,
        unverified=unverified,
        without_address=without_address,
        invitation_template=event.invitation_template_id is not None,
        envelope_template=event.envelope_template_id is not None,
        sender_complete=profile is not None and profile.sender_complete,
    )
