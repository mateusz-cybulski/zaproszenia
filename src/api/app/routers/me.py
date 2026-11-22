from fastapi import APIRouter, HTTPException, status

from app.auth import CurrentUser, IdentityDep, IdentityUnavailableError, SettingsDep
from app.db import Session
from app.models import Profile
from app.schemas.me import MeRead, MeWrite
from app.services.accounts import delete_account_data
from app.storage import FileStorage

router = APIRouter(prefix="/me", tags=["me"])

ACCOUNT_KEPT = "account_kept"


def _me_read(email: str | None, profile: Profile | None) -> MeRead:
    profile = profile or Profile(country="PL")
    return MeRead(
        email=email,
        sender_name=profile.sender_name,
        street=profile.street,
        postal_code=profile.postal_code,
        city=profile.city,
        country=profile.country,
        sender_complete=profile.sender_complete,
    )


@router.get("")
async def get_me(session: Session, user: CurrentUser) -> MeRead:
    return _me_read(user.email, await session.get(Profile, user.uid))


@router.put("")
async def replace_me(payload: MeWrite, session: Session, user: CurrentUser) -> MeRead:
    async with session.begin():
        profile = await session.get(Profile, user.uid) or Profile(owner_uid=user.uid)
        for field, value in payload.model_dump().items():
            setattr(profile, field, value)
        session.add(profile)
    return _me_read(user.email, profile)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(
    session: Session,
    user: CurrentUser,
    storage: FileStorage,
    identity: IdentityDep,
    settings: SettingsDep,
) -> None:
    """Delete all of the user's data and their sign-in account (right to erasure)."""
    await delete_account_data(session, storage, user.uid)
    if settings.dev_auth_user:
        return
    try:
        await identity.delete_user(user.uid)
    except IdentityUnavailableError:
        # A code, not only a message: a plain 503 (e.g. from Cloud Run) means nothing was deleted.
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            {"code": ACCOUNT_KEPT, "message": "Data deleted, the sign-in account is left"},
        ) from None
