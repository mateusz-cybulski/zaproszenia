from datetime import timedelta

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.auth import (
    AuthUser,
    CurrentUser,
    EmailNotVerifiedError,
    IdentityDep,
    IdentityUnavailableError,
    InvalidCredentialsError,
    SettingsDep,
)

# Called only by the frontend server, which keeps the session cookie away from the browser's JS.
router = APIRouter(prefix="/auth", tags=["auth"])


class SessionCreate(BaseModel):
    id_token: str


class SessionRead(BaseModel):
    session_cookie: str
    expires_in: int  # seconds


@router.post("/session")
async def create_session(
    payload: SessionCreate, identity: IdentityDep, settings: SettingsDep
) -> SessionRead:
    """Exchanges a fresh Identity Platform ID token for a session cookie."""
    if settings.dev_auth_user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sign-in is disabled (DEV_AUTH_USER)")
    expires_in = timedelta(days=settings.session_days)
    try:
        cookie = await identity.create_session(payload.id_token, expires_in)
    except EmailNotVerifiedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Email address is not verified") from None
    except InvalidCredentialsError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired sign-in") from None
    except IdentityUnavailableError:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "Sign-in service unavailable"
        ) from None
    return SessionRead(session_cookie=cookie, expires_in=int(expires_in.total_seconds()))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(user: CurrentUser, identity: IdentityDep, settings: SettingsDep) -> None:
    """Revokes the user's sessions on every device."""
    if settings.dev_auth_user:
        return
    try:
        await identity.revoke_sessions(user.uid)
    except IdentityUnavailableError:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "Sign-in service unavailable"
        ) from None


@router.get("/me")
async def me(user: CurrentUser) -> AuthUser:
    return user
