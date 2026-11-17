"""Sign-in with Google Identity Platform.

The browser signs in with email and password and gets a short-lived ID token (one hour).
The frontend server immediately exchanges it here for a session cookie, keeps that in an
httpOnly cookie and sends it with every API request as `Authorization: Bearer <cookie>`.
"""

import asyncio
import time
from collections.abc import Callable
from datetime import timedelta
from functools import cached_property, lru_cache
from typing import Annotated, Any, Protocol

import firebase_admin
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth
from firebase_admin import exceptions as firebase_exceptions
from pydantic import BaseModel

from app.settings import Settings, get_settings

# An ID token starts a session only right after sign-in, so an older stolen token cannot
# (Google's recommendation for session cookies).
MAX_SIGN_IN_AGE_SECONDS = 5 * 60


class AuthUser(BaseModel):
    uid: str
    email: str | None


class InvalidCredentialsError(Exception):
    """Bad, expired or revoked token or cookie, or a disabled or deleted account."""


class EmailNotVerifiedError(Exception):
    """The account exists, but its email address has not been confirmed yet."""


class IdentityUnavailableError(Exception):
    """Identity Platform could not be reached."""


class Identity(Protocol):
    """Identity Platform operations the API needs; replaced by a fake in tests."""

    async def create_session(self, id_token: str, expires_in: timedelta) -> str: ...

    async def verify_session(self, session_cookie: str) -> AuthUser: ...

    async def revoke_sessions(self, uid: str) -> None: ...


class FirebaseIdentity:
    """Identity Platform through firebase-admin, with Application Default Credentials (on
    Cloud Run the service's own account, project from GOOGLE_CLOUD_PROJECT)."""

    @cached_property
    def _app(self) -> firebase_admin.App:
        # Created on first use, so the API starts without Google credentials.
        return firebase_admin.initialize_app()

    async def create_session(self, id_token: str, expires_in: timedelta) -> str:
        def create() -> str:
            claims = firebase_auth.verify_id_token(id_token, app=self._app, check_revoked=True)
            # Self sign-up is open, so an address must be proven before it gets a session.
            if not claims.get("email_verified"):
                raise EmailNotVerifiedError("email address is not verified")
            if time.time() - claims["auth_time"] > MAX_SIGN_IN_AGE_SECONDS:
                raise InvalidCredentialsError("sign-in is too old to start a session")
            cookie = firebase_auth.create_session_cookie(
                id_token, expires_in=expires_in, app=self._app
            )
            return cookie.decode() if isinstance(cookie, bytes) else str(cookie)

        return await _call(create)

    async def verify_session(self, session_cookie: str) -> AuthUser:
        # check_revoked: signing out and disabling an account take effect immediately.
        def verify() -> AuthUser:
            claims: dict[str, Any] = firebase_auth.verify_session_cookie(
                session_cookie, check_revoked=True, app=self._app
            )
            return AuthUser(uid=str(claims["uid"]), email=claims.get("email"))

        return await _call(verify)

    async def revoke_sessions(self, uid: str) -> None:
        def revoke() -> None:
            firebase_auth.revoke_refresh_tokens(uid, app=self._app)

        await _call(revoke)


async def _call[T](function: Callable[[], T]) -> T:
    # firebase-admin is synchronous and does network I/O.
    try:
        return await asyncio.to_thread(function)
    except (
        ValueError,
        firebase_exceptions.InvalidArgumentError,  # bad/expired/revoked token, disabled user
        firebase_exceptions.UnauthenticatedError,
        firebase_auth.UserNotFoundError,
    ) as error:
        raise InvalidCredentialsError(str(error)) from error
    except firebase_exceptions.FirebaseError as error:  # incl. CertificateFetchError
        raise IdentityUnavailableError(str(error)) from error


@lru_cache
def get_identity() -> Identity:
    return FirebaseIdentity()


IdentityDep = Annotated[Identity, Depends(get_identity)]
SettingsDep = Annotated[Settings, Depends(get_settings)]

bearer = HTTPBearer(auto_error=False)


async def current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    identity: IdentityDep,
    settings: SettingsDep,
) -> AuthUser:
    if settings.dev_auth_user:
        return AuthUser(uid=f"dev:{settings.dev_auth_user}", email=settings.dev_auth_user)
    if credentials is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Not signed in", headers={"WWW-Authenticate": "Bearer"}
        )
    try:
        return await identity.verify_session(credentials.credentials)
    except InvalidCredentialsError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invalid or expired session",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except IdentityUnavailableError:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "Sign-in service unavailable"
        ) from None


CurrentUser = Annotated[AuthUser, Depends(current_user)]
