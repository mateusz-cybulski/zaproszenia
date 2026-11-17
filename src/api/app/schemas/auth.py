from pydantic import BaseModel


class AuthUser(BaseModel):
    uid: str
    email: str | None


class SessionCreate(BaseModel):
    id_token: str


class SessionRead(BaseModel):
    session_cookie: str
    expires_in: int  # seconds
