from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GuestWrite(BaseModel):
    """Body for creating a guest and for replacing one (PUT)."""

    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=200)
    email: str | None = Field(default=None, max_length=320, pattern=r"^[^@\s]+@[^@\s]+$")


class GuestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str | None
    created_at: datetime
