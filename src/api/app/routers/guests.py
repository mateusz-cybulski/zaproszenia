from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.auth import CurrentUser
from app.db import Session
from app.models import Guest
from app.schemas import GuestRead, GuestWrite

router = APIRouter(prefix="/guests", tags=["guests"])


async def _own_guest(session: Session, guest_id: int, owner_uid: str) -> Guest:
    # Someone else's guest looks exactly like a missing one: no hint that the id exists.
    guest = await session.get(Guest, guest_id)
    if guest is None or guest.owner_uid != owner_uid:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guest not found")
    return guest


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_guest(payload: GuestWrite, session: Session, user: CurrentUser) -> GuestRead:
    guest = Guest(owner_uid=user.uid, name=payload.name, email=payload.email)
    async with session.begin():
        session.add(guest)
    await session.refresh(guest)
    return GuestRead.model_validate(guest)


@router.get("")
async def list_guests(session: Session, user: CurrentUser) -> list[GuestRead]:
    guests = await session.scalars(
        select(Guest).where(Guest.owner_uid == user.uid).order_by(Guest.id)
    )
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
        guest.name = payload.name
        guest.email = payload.email
    return GuestRead.model_validate(guest)
