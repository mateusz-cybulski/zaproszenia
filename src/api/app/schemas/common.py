from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, Field

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


Text300 = Annotated[str | None, Field(max_length=300), AfterValidator(_blank_to_none)]
Text200 = Annotated[str | None, Field(max_length=200), AfterValidator(_blank_to_none)]
PostalCode = Annotated[str | None, Field(max_length=20), AfterValidator(_blank_to_none)]
Country = Annotated[str, Field(pattern=r"^[A-Za-z]{2}$"), AfterValidator(str.upper)]


class AddressWrite(BaseModel):
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
