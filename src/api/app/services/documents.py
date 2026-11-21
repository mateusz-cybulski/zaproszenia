import asyncio
from datetime import UTC, datetime
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    VERIFIED_STATUSES,
    Event,
    EventGuest,
    Guest,
    InvitationStatus,
    Profile,
    Template,
    TemplateKind,
)
from app.schemas.documents import DocumentProblem
from app.services.event_guests import active_guests_of, in_list_order
from app.services.pdf import render_all
from app.services.placeholders import event_and_sender_values, guest_values
from app.services.templates import base_pdf
from app.storage import Storage


class DocumentProblemError(Exception):
    def __init__(self, problem: DocumentProblem) -> None:
        super().__init__(problem.code)
        self.problem = problem


def _guest_record(guest: Guest) -> dict[str, Any]:
    return {
        "full_name": guest.full_name,
        "position": guest.position,
        "institution": guest.institution,
        "salutation": guest.salutation,
        "declension": guest.declension,
        "street": guest.street,
        "postal_code": guest.postal_code,
        "city": guest.city,
        "country": guest.country,
    }


def _template_id(event: Event, kind: TemplateKind) -> int | None:
    if kind == TemplateKind.INVITATION:
        return event.invitation_template_id
    return event.envelope_template_id


async def event_document(
    session: AsyncSession,
    storage: Storage,
    event: Event,
    kind: TemplateKind,
    owner_uid: str,
    *,
    confirmed: bool,
) -> bytes:
    """Every guest on the event's list on one template, in list order, as one PDF.

    Invitations and envelopes come out in the same order, so they can be matched after printing.
    Generating invitations marks the guests as generated.
    """
    event_guests = list(await session.scalars(in_list_order(active_guests_of(event.id))))
    if not event_guests:
        raise DocumentProblemError(DocumentProblem(code="no_guests"))
    template_id = _template_id(event, kind)
    template = await session.get(Template, template_id) if template_id else None
    if template is None:
        raise DocumentProblemError(DocumentProblem(code="no_template"))
    profile = await session.get(Profile, owner_uid)
    unverified = sum(
        1 for item in event_guests if item.guest.verification_status not in VERIFIED_STATUSES
    )
    sender_incomplete = profile is None or not profile.sender_complete
    if (unverified or sender_incomplete) and not confirmed:
        raise DocumentProblemError(
            DocumentProblem(
                code="needs_confirmation",
                unverified=unverified,
                sender_incomplete=sender_incomplete,
            )
        )

    shared = event_and_sender_values(event, profile)
    values = [{**shared, **guest_values(_guest_record(item.guest))} for item in event_guests]
    pdf = await asyncio.to_thread(
        render_all, await base_pdf(template, storage), template.fields, values
    )
    if kind == TemplateKind.INVITATION:
        _mark_generated(event_guests)
    await session.commit()
    return pdf


def _mark_generated(event_guests: list[EventGuest]) -> None:
    now = datetime.now(UTC)
    for item in event_guests:
        item.generated_at = now
        if item.status == InvitationStatus.ADDED:
            item.status = InvitationStatus.GENERATED
