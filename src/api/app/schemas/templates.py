from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.models import TemplateKind
from app.schemas.common import Case

MAX_PAGES = 4
MAX_FIELDS = 50

TemplateName = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)
]
FontName = Literal["serif", "serif-bold", "serif-italic", "sans", "sans-bold"]
Alignment = Literal["left", "center", "right"]
DateFormat = Literal["long", "long_plain", "weekday_long", "numeric", "numeric_suffix", "roman"]
DeclinablePlaceholder = Literal["recipient", "full_name", "position", "institution"]


class TemplatePage(BaseModel):
    width_mm: float
    height_mm: float


class TemplateField(BaseModel):
    """A text box on a template page, in mm from the page's top left corner."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1, max_length=64)
    page: int = Field(default=0, ge=0, lt=MAX_PAGES)
    x_mm: float = Field(ge=0, le=1000)
    y_mm: float = Field(ge=0, le=1000)
    width_mm: float = Field(gt=1, le=1000)
    content: str = Field(min_length=1, max_length=2000)
    font: FontName = "serif"
    font_size: float = Field(default=12, ge=4, le=96)
    align: Alignment = "left"
    color: str = Field(default="#1a1a1a", pattern=r"^#[0-9a-fA-F]{6}$")
    line_height: float = Field(default=1.3, ge=0.8, le=3)
    date_format: DateFormat = "long"
    # A missing entry is the nominative.
    cases: dict[DeclinablePlaceholder, Case] = Field(default_factory=dict)


Fields = Annotated[list[TemplateField], Field(max_length=MAX_FIELDS)]


class TemplateUpdate(BaseModel):
    name: TemplateName | None = None
    fields: Fields | None = None


class TemplatePreview(BaseModel):
    fields: Fields
    page: int = Field(default=0, ge=0, lt=MAX_PAGES)


class TemplateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    kind: TemplateKind
    name: str
    is_system: bool
    has_file: bool
    pages: list[TemplatePage]
    fields: list[TemplateField]
    created_at: datetime
    updated_at: datetime


class PlaceholderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    label: str
    group: str
    description: str
    example: str


class DateFormatRead(BaseModel):
    value: DateFormat
    example: str


class CaseRead(BaseModel):
    value: Case
    label: str
    examples: dict[DeclinablePlaceholder, str]
