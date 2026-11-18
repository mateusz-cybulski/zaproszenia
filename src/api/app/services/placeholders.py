import re
import unicodedata
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from app.schemas.common import Case
from app.schemas.templates import DateFormat, DeclinablePlaceholder

# Plain substitution, not a template language: a field can only reference names from PLACEHOLDERS.
ANY_TOKEN = re.compile(r"\{([^{}\n]*)\}")


@dataclass(frozen=True)
class Placeholder:
    name: str
    label: str
    group: str
    description: str
    example: str


GUEST, EVENT, SENDER = "Gość", "Wydarzenie", "Nadawca"

PLACEHOLDERS = (
    Placeholder(
        "salutation",
        "Zwrot grzecznościowy",
        GUEST,
        "Np. „Szanowny Panie Profesorze”. Gdy go brak: „Szanowni Państwo”.",
        "Szanowny Panie Rektorze",
    ),
    Placeholder(
        "recipient",
        "Adresat",
        GUEST,
        "Imię i nazwisko gościa, a gdy zapraszasz całą instytucję: jej nazwa.",
        "prof. dr hab. Jan Kowalski",
    ),
    Placeholder(
        "full_name", "Imię i nazwisko", GUEST, "Razem z tytułami.", "prof. dr hab. Jan Kowalski"
    ),
    Placeholder("position", "Stanowisko", GUEST, "Stanowisko gościa.", "Rektor"),
    Placeholder(
        "institution", "Instytucja", GUEST, "Instytucja gościa.", "Politechnika Warszawska"
    ),
    Placeholder(
        "address",
        "Adres gościa",
        GUEST,
        "Ulica oraz kod i miasto, w dwóch liniach.",
        "pl. Politechniki 1\n00-661 Warszawa",
    ),
    Placeholder(
        "recipient_block",
        "Blok adresowy",
        GUEST,
        "Gotowy adres na kopertę: adresat, stanowisko, instytucja i adres.",
        "prof. dr hab. Jan Kowalski\nRektor\nPolitechnika Warszawska\n"
        "pl. Politechniki 1\n00-661 Warszawa",
    ),
    Placeholder("event_name", "Nazwa wydarzenia", EVENT, "Nazwa wydarzenia.", "Gala Jubileuszowa"),
    Placeholder("event_date", "Data", EVENT, "Data wydarzenia.", "15 października 2026 r."),
    Placeholder("event_time", "Godzina", EVENT, "Godzina rozpoczęcia.", "18:00"),
    Placeholder("event_weekday", "Dzień tygodnia", EVENT, "Dzień tygodnia wydarzenia.", "czwartek"),
    Placeholder(
        "venue", "Miejsce", EVENT, "Nazwa miejsca, np. sali lub budynku.", "Zamek Królewski"
    ),
    Placeholder(
        "event_address",
        "Adres miejsca",
        EVENT,
        "Adres miejsca wydarzenia, w dwóch liniach.",
        "pl. Zamkowy 4\n00-277 Warszawa",
    ),
    Placeholder(
        "invitation_text",
        "Treść zaproszenia",
        EVENT,
        "Tekst wpisany w szczegółach wydarzenia.",
        "Mamy zaszczyt zaprosić na galę.",
    ),
    Placeholder(
        "sender_name", "Nadawca", SENDER, "Nazwa nadawcy z ustawień.", "Fundacja Przykładowa"
    ),
    Placeholder(
        "sender_address",
        "Adres nadawcy",
        SENDER,
        "Adres zwrotny z ustawień, w dwóch liniach.",
        "ul. Długa 5\n00-001 Warszawa",
    ),
)
PLACEHOLDER_NAMES = frozenset(placeholder.name for placeholder in PLACEHOLDERS)


def _normalize_name(name: str) -> str:
    # NFKD does not decompose "ł", so it is folded by hand.
    folded = unicodedata.normalize("NFKD", name.replace("ł", "l").replace("Ł", "L"))
    plain = "".join(char for char in folded if not unicodedata.combining(char))
    return " ".join(plain.split()).casefold()


_NAME_BY_ALIAS = {
    _normalize_name(alias): placeholder.name
    for placeholder in PLACEHOLDERS
    for alias in (placeholder.name, placeholder.label)
}


def to_storage(content: str) -> str:
    """Turn "{zwrot grzecznościowy}" into "{salutation}", so renaming a label never breaks a
    saved template. Unknown names stay as typed for validation to report them."""

    def replace(match: re.Match[str]) -> str:
        name = _NAME_BY_ALIAS.get(_normalize_name(match.group(1)))
        return "{" + name + "}" if name else match.group(0)

    return ANY_TOKEN.sub(replace, content)


def unknown_placeholders(content: str) -> set[str]:
    return set(ANY_TOKEN.findall(content)) - PLACEHOLDER_NAMES


MONTHS_GENITIVE = (
    "stycznia",
    "lutego",
    "marca",
    "kwietnia",
    "maja",
    "czerwca",
    "lipca",
    "sierpnia",
    "września",
    "października",
    "listopada",
    "grudnia",
)
ROMAN_MONTHS = ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII")
WEEKDAYS = ("poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela")


def _long_plain(moment: datetime) -> str:
    return f"{moment.day} {MONTHS_GENITIVE[moment.month - 1]} {moment.year}"


def _numeric(moment: datetime) -> str:
    return f"{moment.day:02d}.{moment.month:02d}.{moment.year}"


# In the order the editor lists them.
DATE_FORMATS: dict[DateFormat, Callable[[datetime], str]] = {
    "long": lambda moment: f"{_long_plain(moment)} r.",
    "long_plain": _long_plain,
    "weekday_long": lambda moment: f"{WEEKDAYS[moment.weekday()]}, {_long_plain(moment)} r.",
    "numeric": _numeric,
    "numeric_suffix": lambda moment: f"{_numeric(moment)} r.",
    "roman": lambda moment: f"{moment.day} {ROMAN_MONTHS[moment.month - 1]} {moment.year} r.",
}
SAMPLE_EVENT_START = datetime(2026, 10, 15, 18, 0)

SAMPLE_NOMINATIVE: dict[DeclinablePlaceholder, str] = {
    "recipient": "prof. dr hab. Jan Kowalski",
    "full_name": "prof. dr hab. Jan Kowalski",
    "position": "Rektor",
    "institution": "Politechnika Warszawska",
}
SAMPLE_DECLENSION: dict[str, dict[Case, str]] = {
    "full_name": {
        "gen": "prof. dr. hab. Jana Kowalskiego",
        "dat": "prof. dr. hab. Janowi Kowalskiemu",
        "acc": "prof. dr. hab. Jana Kowalskiego",
        "inst": "prof. dr. hab. Janem Kowalskim",
        "loc": "prof. dr. hab. Janie Kowalskim",
        "voc": "prof. dr. hab. Janie Kowalski",
    },
    "position": {
        "gen": "Rektora",
        "dat": "Rektorowi",
        "acc": "Rektora",
        "inst": "Rektorem",
        "loc": "Rektorze",
        "voc": "Rektorze",
    },
    "institution": {
        "gen": "Politechniki Warszawskiej",
        "dat": "Politechnice Warszawskiej",
        "acc": "Politechnikę Warszawską",
        "inst": "Politechniką Warszawską",
        "loc": "Politechnice Warszawskiej",
        "voc": "Politechniko Warszawska",
    },
}


def case_example(name: DeclinablePlaceholder, case: Case) -> str:
    if case == "nom":
        return SAMPLE_NOMINATIVE[name]
    source = "full_name" if name == "recipient" else name
    return SAMPLE_DECLENSION[source][case]


TOKEN = re.compile(r"\{([a-z_]+)\}")
DEFAULT_SALUTATION = "Szanowni Państwo"
DECLINED_SOURCES: tuple[DeclinablePlaceholder, ...] = ("full_name", "position", "institution")


def fill(content: str, values: dict[str, str]) -> str:
    """Substitute values. A line left empty by its placeholders disappears, so an address block
    has no gap for a guest without, e.g., a position."""
    lines = []
    for line in content.split("\n"):
        filled = TOKEN.sub(lambda match: values.get(match.group(1), ""), line)
        if TOKEN.search(line) and not filled.strip():
            continue
        lines.extend(filled.split("\n"))
    return "\n".join(lines)


def address_lines(
    street: str | None, postal_code: str | None, city: str | None, country: str | None
) -> list[str]:
    lines = [street or "", " ".join(part for part in (postal_code, city) if part)]
    if country and country != "PL":
        lines.append(country)
    return [line for line in lines if line]


def guest_values(guest: dict[str, Any]) -> dict[str, str]:
    full_name = guest.get("full_name") or ""
    institution = guest.get("institution") or ""
    position = guest.get("position") or ""
    address = address_lines(
        guest.get("street"), guest.get("postal_code"), guest.get("city"), guest.get("country")
    )
    # A whole institution invited without a person: its name is the first line.
    head = [full_name, position, institution] if full_name else [institution, position]
    values = {
        "salutation": guest.get("salutation") or DEFAULT_SALUTATION,
        "recipient": full_name or institution,
        "full_name": full_name,
        "position": position,
        "institution": institution,
        "address": "\n".join(address),
        "recipient_block": "\n".join(line for line in [*head, *address] if line),
    }
    declension: dict[str, dict[str, str]] = guest.get("declension") or {}
    for name in DECLINED_SOURCES:
        for case, form in (declension.get(name) or {}).items():
            values[f"{name}:{case}"] = form
    recipient_source = "full_name" if full_name else "institution"
    for case, form in (declension.get(recipient_source) or {}).items():
        values[f"recipient:{case}"] = form
    return values


def event_values(
    name: str, starts_at: datetime, venue: str, address: list[str], invitation_text: str
) -> dict[str, str]:
    values = {
        "event_name": name,
        "event_time": starts_at.strftime("%H:%M"),
        "event_weekday": WEEKDAYS[starts_at.weekday()],
        "venue": venue,
        "event_address": "\n".join(address),
        "invitation_text": invitation_text,
    }
    for date_format, formatter in DATE_FORMATS.items():
        values[f"event_date:{date_format}"] = formatter(starts_at)
    return values


def field_values(values: dict[str, str], field: dict[str, Any]) -> dict[str, str]:
    """Values for one template field: its date format and the cases it asks for."""
    resolved = {**values, "event_date": values.get(f"event_date:{field['date_format']}", "")}
    for name, case in field["cases"].items():
        if case != "nom" and f"{name}:{case}" in values:
            resolved[name] = values[f"{name}:{case}"]
    return resolved


SAMPLE_GUEST: dict[str, Any] = {
    "full_name": SAMPLE_NOMINATIVE["full_name"],
    "position": SAMPLE_NOMINATIVE["position"],
    "institution": SAMPLE_NOMINATIVE["institution"],
    "salutation": "Szanowny Panie Rektorze",
    "declension": SAMPLE_DECLENSION,
    "street": "pl. Politechniki 1",
    "postal_code": "00-661",
    "city": "Warszawa",
    "country": "PL",
}


def sample_values() -> dict[str, str]:
    """Sample data for previews, independent of any event."""
    return {
        **guest_values(SAMPLE_GUEST),
        **event_values(
            "Gala Jubileuszowa",
            SAMPLE_EVENT_START,
            "Zamek Królewski",
            ["pl. Zamkowy 4", "00-277 Warszawa"],
            "Mamy zaszczyt zaprosić na galę.",
        ),
        "sender_name": "Fundacja Przykładowa",
        "sender_address": "ul. Długa 5\n00-001 Warszawa",
    }
