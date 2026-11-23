from typing import Annotated, Literal, final

from pydantic import AfterValidator, BaseModel, ConfigDict, Field

from app.models import TextLimit

# Grammatical cases (Morfeusz tag names). The nominative is simply the value as entered.
Case = Literal["nom", "gen", "dat", "acc", "inst", "loc", "voc"]
ObliqueCase = Literal["gen", "dat", "acc", "inst", "loc", "voc"]
CASE_LABELS: dict[Case, str] = {
    "nom": "Mianownik (kto?)",
    "gen": "Dopełniacz (kogo?)",
    "dat": "Celownik (komu?)",
    "acc": "Biernik (kogo?)",
    "inst": "Narzędnik (z kim?)",
    "loc": "Miejscownik (o kim?)",
    "voc": "Wołacz",
}


def _blank_to_none(value: str | None) -> str | None:
    return value or None


@final
class TextField:
    Short = Annotated[str, Field(min_length=1, max_length=TextLimit.SHORT)]
    OptionalShort = Annotated[
        str | None, Field(max_length=TextLimit.SHORT), AfterValidator(_blank_to_none)
    ]
    OptionalLong = Annotated[
        str | None, Field(max_length=TextLimit.LONG), AfterValidator(_blank_to_none)
    ]
    City = Annotated[str, Field(min_length=1, max_length=TextLimit.CITY)]
    PostalCode = Annotated[str, Field(min_length=1, max_length=TextLimit.POSTAL_CODE)]
    OptionalCity = Annotated[
        str | None, Field(max_length=TextLimit.CITY), AfterValidator(_blank_to_none)
    ]
    OptionalPostalCode = Annotated[
        str | None, Field(max_length=TextLimit.POSTAL_CODE), AfterValidator(_blank_to_none)
    ]


Country = Annotated[str, Field(pattern=r"^[A-Za-z]{2}$"), AfterValidator(str.upper)]


class AddressWrite(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    street: TextField.OptionalShort = None
    postal_code: TextField.OptionalPostalCode = None
    city: TextField.OptionalCity = None
    country: Country = "PL"


class AddressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    street: str | None
    postal_code: str | None
    city: str | None
    country: str
