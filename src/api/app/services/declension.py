"""Oblique cases of a guest's name, position and institution, from the SGJP dictionary.

A phrase that cannot be declined with confidence gets no forms, so templates print the
nominative instead of a half-declined name.
"""

import logging
from typing import Final, get_args

from app.morphology import Interpretation, analyse_word, generate
from app.schemas.common import ObliqueCase

logger = logging.getLogger(__name__)

OBLIQUE_CASES: Final[tuple[ObliqueCase, ...]] = get_args(ObliqueCase)
PERSON_GENDERS: Final = ("m1", "f")
PERSON_NAMES: Final = frozenset({"imię", "nazwisko"})
# Abbreviations written without a final period get one when the word they stand for is
# inflected: "dr Jan Nowak", "dr. Jana Nowaka". Only for a man: "dr Anny Nowak".
PERIOD_WHEN_DECLINED: Final = frozenset({"dr", "mgr"})

Forms = dict[ObliqueCase, str]


def _matching_case(word: str, form: str) -> str:
    if word.isupper() and len(word) > 1:
        return form.upper()
    if word[:1].isupper():
        return form[:1].upper() + form[1:]
    return form


def _forms_of(interpretation: Interpretation, number: str, gender: str) -> Forms | None:
    """The interpretation's lemma in every oblique case, or None if a case is missing."""
    base = interpretation.lemma.split(":", 1)[0]
    candidates = [
        form
        for form in generate(base)
        if form.lemma == interpretation.lemma
        and form.part_of_speech == interpretation.part_of_speech
    ]
    forms: Forms = {}
    for case in OBLIQUE_CASES:
        found = next(
            (
                form.orth
                for form in candidates
                if form.has(number, case, gender)
                and (form.part_of_speech != "adj" or form.has("pos"))
            ),
            None,
        )
        if found is None:
            return None
        forms[case] = _matching_case(interpretation.orth, found)
    return forms


def _is_title(word: str) -> bool:
    # "Jan" is also an abbreviation in SGJP, so only a word that is nothing but one counts.
    if word.endswith(".") or word in PERIOD_WHEN_DECLINED:
        return True
    interpretations = analyse_word(word)
    return bool(interpretations) and all(item.part_of_speech == "brev" for item in interpretations)


def _join(words: list[Forms], case: ObliqueCase) -> str:
    return " ".join(forms[case] for forms in words)


def _constant(word: str) -> Forms:
    return dict.fromkeys(OBLIQUE_CASES, word)


def _person_gender(words: list[str]) -> str | None:
    for word in words:
        for item in analyse_word(word):
            if "imię" in item.names and item.has("sg", "nom"):
                gender = next((g for g in PERSON_GENDERS if item.has(g)), None)
                if gender:
                    return gender
    return None


def _decline_name_part(part: str, gender: str) -> Forms | None:
    for item in analyse_word(part):
        is_name = item.part_of_speech == "subst" and bool(item.names & PERSON_NAMES)
        if is_name and item.has("sg", "nom", gender):
            forms = _forms_of(item, "sg", gender)
            if forms:
                return forms
    return None


def decline_person(full_name: str) -> tuple[Forms, str | None]:
    """A person's name with titles, and the person's gender ("m1" or "f") when known."""
    words = full_name.split()
    gender = _person_gender([word for word in words if not _is_title(word)])
    if gender is None:
        return {}, None
    declined: list[Forms] = []
    for word in words:
        if _is_title(word):
            title = word
            if gender == "m1" and word in PERIOD_WHEN_DECLINED:
                title = f"{word}."
            declined.append(dict.fromkeys(OBLIQUE_CASES, title))
            continue
        parts = [_decline_name_part(part, gender) for part in word.split("-")]
        if any(part is None for part in parts):
            logger.info("No declension for %r: %r is not in the dictionary", full_name, word)
            return {}, gender
        declined.append(
            {case: "-".join(part[case] for part in parts if part) for case in OBLIQUE_CASES}
        )
    return {case: _join(declined, case) for case in OBLIQUE_CASES}, gender


def _agreeing_adjective(word: str, number: str, gender: str) -> Interpretation | None:
    return next(
        (
            item
            for item in analyse_word(word)
            if item.part_of_speech == "adj" and item.has(number, "nom", gender)
        ),
        None,
    )


def _head_nouns(word: str, gender: str | None) -> list[tuple[Interpretation, str, str]]:
    """The word read as a noun in the nominative: (interpretation, number, gender) each."""
    readings = []
    for item in analyse_word(word):
        if item.part_of_speech != "subst" or not item.has("nom"):
            continue
        for item_gender in ("m1", "m2", "m3", "f", "n"):
            if item.has(item_gender) and gender in (None, item_gender):
                readings.append((item, "sg" if item.has("sg") else "pl", item_gender))
    return readings


def decline_noun_phrase(text: str, gender: str | None = None) -> Forms:
    """A position or an institution: the head noun and the adjectives agreeing with it.

    The head is the last noun preceded only by agreeing adjectives ("Polska Akademia Nauk");
    the first word after it that does not agree ends the phrase, and the rest stays as written:
    "Urząd Miasta Gdańska" -> "Urzędowi Miasta Gdańska", "Muzeum Narodowe w Krakowie" ->
    "Muzeum Narodowego w Krakowie". With a gender (the guest's), the noun is read in that
    gender, so "Dyrektor" for a woman stays "Dyrektor".
    """
    words = text.split()
    head: tuple[int, Interpretation, str, str] | None = None
    for index, word in enumerate(words):
        for noun, number, noun_gender in _head_nouns(word, gender):
            before = words[:index]
            if all(_agreeing_adjective(other, number, noun_gender) for other in before):
                head = (index, noun, number, noun_gender)
                break
    if head is None:
        return {}
    head_index, noun, number, noun_gender = head
    head_forms = _forms_of(noun, number, noun_gender)
    if head_forms is None:
        return {}

    declined: list[Forms] = []
    for index, word in enumerate(words):
        if index == head_index:
            declined.append(head_forms)
            continue
        adjective = _agreeing_adjective(word, number, noun_gender)
        forms = _forms_of(adjective, number, noun_gender) if adjective else None
        if index < head_index and forms is None:
            return {}
        if index > head_index and forms is None:
            # The first word that does not agree ends the phrase: the rest stays as written.
            declined.extend(_constant(rest) for rest in words[index:])
            break
        declined.append(forms or _constant(word))
    return {case: _join(declined, case) for case in OBLIQUE_CASES}


def guest_declension(
    full_name: str | None, position: str | None, institution: str | None
) -> dict[str, Forms]:
    """Forms for the guest's declinable fields, as stored in Guest.declension."""
    person, gender = decline_person(full_name) if full_name else ({}, None)
    return {
        "full_name": person,
        "position": decline_noun_phrase(position, gender) if position else {},
        "institution": decline_noun_phrase(institution) if institution else {},
    }
