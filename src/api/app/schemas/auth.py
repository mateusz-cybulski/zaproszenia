from pydantic import BaseModel


class AuthUser(BaseModel):
    """The signed-in user, from an Identity Platform session."""

    uid: str
    email: str | None


class SessionCreate(BaseModel):
    id_token: str


class SessionRead(BaseModel):
    session_cookie: str
    expires_in: int  # seconds
