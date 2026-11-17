from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field


def _blank_to_none(value: str | None) -> str | None:
    return value or None


# Optional text: trimmed (see model_config), and an empty string means "not given".
Text300 = Annotated[str | None, Field(max_length=300), AfterValidator(_blank_to_none)]
Text200 = Annotated[str | None, Field(max_length=200), AfterValidator(_blank_to_none)]
PostalCode = Annotated[str | None, Field(max_length=20), AfterValidator(_blank_to_none)]
# ISO 3166-1 alpha-2, stored upper-case.
Country = Annotated[str, Field(pattern=r"^[A-Za-z]{2}$"), AfterValidator(str.upper)]


class AddressWrite(BaseModel):
    """Address fields of a write body (models.AddressMixin)."""

    model_config = ConfigDict(str_strip_whitespace=True)

    street: Text300 = None
    postal_code: PostalCode = None
    city: Text200 = None
    country: Country = "PL"


class AddressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    street: str | None
    postal_code: str | None
    city: str | None
    country: str
