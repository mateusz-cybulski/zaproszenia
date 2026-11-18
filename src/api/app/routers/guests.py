from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import or_, select

from app.auth import CurrentUser
from app.db import Session
from app.models import VERIFIED_STATUSES, Guest, VerificationStatus
from app.schemas.guests import (
    DECLINED_FIELDS,
    VERIFIED_FIELDS,
    GuestRead,
    GuestWrite,
    ManualVerification,
    ManualVerificationResult,
)

router = APIRouter(prefix="/guests", tags=["guests"])


async def _own_guest(session: Session, guest_id: int, owner_uid: str) -> Guest:
    # Someone else's guest looks exactly like a missing one: no hint that the id exists.
    guest = await session.get(Guest, guest_id)
    if guest is None or guest.owner_uid != owner_uid:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guest not found")
    return guest


def _escape_like(text: str) -> str:
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _verify_manually(guest: Guest) -> None:
    guest.verification_status = VerificationStatus.VERIFIED_MANUAL
    guest.verified_at = datetime.now(UTC)


@router.post("/verification/manual")
async def verify_many_manually(
    payload: ManualVerification, session: Session, user: CurrentUser
) -> ManualVerificationResult:
    statement = select(Guest).where(
        Guest.owner_uid == user.uid, Guest.verification_status.not_in(VERIFIED_STATUSES)
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


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_guest(payload: GuestWrite, session: Session, user: CurrentUser) -> GuestRead:
    guest = Guest(owner_uid=user.uid, **payload.model_dump())
    async with session.begin():
        session.add(guest)
    await session.refresh(guest)
    return GuestRead.model_validate(guest)


@router.get("")
async def list_guests(
    session: Session,
    user: CurrentUser,
    q: Annotated[str | None, Query(max_length=200)] = None,
) -> list[GuestRead]:
    statement = select(Guest).where(Guest.owner_uid == user.uid).order_by(Guest.id)
    if q and q.strip():
        pattern = f"%{_escape_like(q.strip())}%"
        statement = statement.where(
            or_(
                Guest.full_name.ilike(pattern, escape="\\"),
                Guest.institution.ilike(pattern, escape="\\"),
            )
        )
    guests = await session.scalars(statement)
    return [GuestRead.model_validate(guest) for guest in guests]


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
            guest.declension = None
        if changed & set(VERIFIED_FIELDS):
            guest.verification_status = VerificationStatus.PENDING
            guest.verification_result = None
            guest.verified_at = None
    await session.refresh(guest)  # updated_at is set by the database
    return GuestRead.model_validate(guest)
