from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy import select

from app.auth import CurrentUser
from app.db import Session
from app.dependencies import Pagination, find_own_event
from app.models import VERIFIED_STATUSES, EventGuest, Guest, VerificationStatus
from app.schemas.guests import (
    DECLINED_FIELDS,
    VERIFIED_FIELDS,
    AiVerificationAccept,
    GuestRead,
    GuestWrite,
    ManualVerification,
    ManualVerificationResult,
)
from app.schemas.pagination import Page
from app.services.declension import guest_declension
from app.services.guests import SEARCH_MAX_LENGTH, guest_search
from app.services.pagination import paginate
from app.services.verification import accept_ai_result, ask_ai, guest_data, store_ai_result
from app.verifier import Verifier

router = APIRouter(prefix="/guests", tags=["guests"])

GUEST_CHANGED_DURING_CHECK = "Dane gościa zmieniły się w trakcie weryfikacji. Spróbuj ponownie."


async def _own_guest(
    session: Session, guest_id: int, owner_uid: str, *, deleted: bool | None = False
) -> Guest:
    """The user's guest, active by default; deleted=True for deleted ones, None for either."""
    # Someone else's guest looks exactly like a missing one: no hint that the id exists.
    guest = await session.get(Guest, guest_id)
    if guest is None or guest.owner_uid != owner_uid:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guest not found")
    if deleted is not None and (guest.deleted_at is not None) != deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guest not found")
    return guest


def _verify_manually(guest: Guest) -> None:
    guest.verification_status = VerificationStatus.VERIFIED_MANUAL
    guest.verified_at = datetime.now(UTC)


@router.post("/verification/manual")
async def verify_many_manually(
    payload: ManualVerification, session: Session, user: CurrentUser
) -> ManualVerificationResult:
    statement = select(Guest).where(
        Guest.owner_uid == user.uid,
        Guest.deleted_at.is_(None),
        Guest.verification_status.not_in(VERIFIED_STATUSES),
    )
    if payload.guest_ids is not None:
        statement = statement.where(Guest.id.in_(payload.guest_ids))
    async with session.begin():
        guests = (await session.scalars(statement)).all()
        for guest in guests:
            _verify_manually(guest)
    return ManualVerificationResult(verified=len(guests))


@router.post("/{guest_id}/verification/manual")
async def verify_manually(guest_id: int, session: Session, user: CurrentUser) -> GuestRead:
    async with session.begin():
        guest = await _own_guest(session, guest_id, user.uid)
        _verify_manually(guest)
    await session.refresh(guest)
    return GuestRead.model_validate(guest)


@router.post("/{guest_id}/verification/ai")
async def verify_with_ai_endpoint(
    guest_id: int, session: Session, user: CurrentUser, verifier: Verifier
) -> GuestRead:
    """Checks one guest with AI; the result (or why it failed) is stored on the guest."""
    async with session.begin():
        data = guest_data(await _own_guest(session, guest_id, user.uid))
    # No transaction stays open while the model answers (seconds).
    check = await ask_ai(data, verifier)
    async with session.begin():
        guest = await _own_guest(session, guest_id, user.uid)
        if guest_data(guest) != data:
            raise HTTPException(status.HTTP_409_CONFLICT, GUEST_CHANGED_DURING_CHECK)
        store_ai_result(guest, check, verifier.model)
    await session.refresh(guest)
    return GuestRead.model_validate(guest)


@router.post("/{guest_id}/verification/ai/accept")
async def accept_ai_verification(
    guest_id: int, payload: AiVerificationAccept, session: Session, user: CurrentUser
) -> GuestRead:
    async with session.begin():
        guest = await _own_guest(session, guest_id, user.uid)
        try:
            accept_ai_result(guest, set(payload.accept))
        except ValidationError as error:
            raise RequestValidationError(error.errors()) from None
        except ValueError:
            raise HTTPException(
                status.HTTP_409_CONFLICT, "Najpierw zweryfikuj gościa z AI."
            ) from None
    await session.refresh(guest)
    return GuestRead.model_validate(guest)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_guest(payload: GuestWrite, session: Session, user: CurrentUser) -> GuestRead:
    guest = Guest(owner_uid=user.uid, **payload.model_dump())
    guest.declension = guest_declension(guest.full_name, guest.position, guest.institution)
    async with session.begin():
        session.add(guest)
    await session.refresh(guest)
    return GuestRead.model_validate(guest)


@router.get("")
async def list_guests(
    session: Session,
    user: CurrentUser,
    pagination: Pagination,
    q: Annotated[str | None, Query(max_length=SEARCH_MAX_LENGTH)] = None,
    deleted: bool = False,
    not_on_event: Annotated[
        int | None, Query(description="Only guests not on this event's list")
    ] = None,
) -> Page[GuestRead]:
    statement = select(Guest).where(Guest.owner_uid == user.uid)
    if deleted:
        statement = statement.where(Guest.deleted_at.is_not(None)).order_by(
            Guest.deleted_at.desc(), Guest.id
        )
    else:
        statement = statement.where(Guest.deleted_at.is_(None)).order_by(Guest.id)
    if q and q.strip():
        statement = statement.where(guest_search(q))
    if not_on_event is not None:
        event = await find_own_event(session, not_on_event, user.uid)
        on_list = select(EventGuest.guest_id).where(EventGuest.event_id == event.id)
        statement = statement.where(Guest.id.not_in(on_list))
    guests, total = await paginate(session, statement, pagination)
    return Page[GuestRead](
        items=[GuestRead.model_validate(guest) for guest in guests],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get("/{guest_id}")
async def get_guest(guest_id: int, session: Session, user: CurrentUser) -> GuestRead:
    return GuestRead.model_validate(await _own_guest(session, guest_id, user.uid))


@router.put("/{guest_id}")
async def replace_guest(
    guest_id: int, payload: GuestWrite, session: Session, user: CurrentUser
) -> GuestRead:
    async with session.begin():
        guest = await _own_guest(session, guest_id, user.uid)
        changes = payload.model_dump()
        changed = {field for field, value in changes.items() if getattr(guest, field) != value}
        for field, value in changes.items():
            setattr(guest, field, value)
        if changed & set(DECLINED_FIELDS):
            guest.declension = guest_declension(guest.full_name, guest.position, guest.institution)
        if changed & set(VERIFIED_FIELDS):
            guest.verification_status = VerificationStatus.PENDING
            guest.verification_result = None
            guest.verified_at = None
    await session.refresh(guest)  # updated_at is set by the database
    return GuestRead.model_validate(guest)


@router.delete("/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_guest(
    guest_id: int, session: Session, user: CurrentUser, permanent: bool = False
) -> None:
    """Move the guest to the deleted list, or with permanent=true remove it for good."""
    async with session.begin():
        if permanent:
            await session.delete(await _own_guest(session, guest_id, user.uid, deleted=None))
        else:
            guest = await _own_guest(session, guest_id, user.uid)
            guest.deleted_at = datetime.now(UTC)


@router.post("/{guest_id}/restore")
async def restore_guest(guest_id: int, session: Session, user: CurrentUser) -> GuestRead:
    async with session.begin():
        guest = await _own_guest(session, guest_id, user.uid, deleted=True)
        guest.deleted_at = None
    await session.refresh(guest)
    return GuestRead.model_validate(guest)
