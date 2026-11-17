from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.db import Session
from app.models import Guest
from app.schemas import GuestRead, GuestWrite

router = APIRouter(prefix="/guests", tags=["guests"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_guest(payload: GuestWrite, session: Session) -> GuestRead:
    guest = Guest(name=payload.name, email=payload.email)
    async with session.begin():
        session.add(guest)
    await session.refresh(guest)
    return GuestRead.model_validate(guest)


@router.get("")
async def list_guests(session: Session) -> list[GuestRead]:
    guests = await session.scalars(select(Guest).order_by(Guest.id))
    return [GuestRead.model_validate(guest) for guest in guests]


@router.get("/{guest_id}")
async def get_guest(guest_id: int, session: Session) -> GuestRead:
    guest = await session.get(Guest, guest_id)
    if guest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guest not found")
    return GuestRead.model_validate(guest)


@router.put("/{guest_id}")
async def replace_guest(guest_id: int, payload: GuestWrite, session: Session) -> GuestRead:
    async with session.begin():
        guest = await session.get(Guest, guest_id)
        if guest is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Guest not found")
        guest.name = payload.name
        guest.email = payload.email
    return GuestRead.model_validate(guest)
