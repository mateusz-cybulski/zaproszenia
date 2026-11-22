"""Polish word forms from Morfeusz 2 with its bundled SGJP dictionary, behind typed functions."""

import threading
from dataclasses import dataclass
from typing import Any

import morfeusz2


@dataclass(frozen=True)
class Interpretation:
    orth: str
    lemma: str
    part_of_speech: str
    # Each tag position after the part of speech, with its alternatives: sg:nom.acc -> ({sg}, ...)
    categories: tuple[frozenset[str], ...]
    names: frozenset[str]

    def has(self, *values: str) -> bool:
        """Every value appears in some position of the tag, e.g. has("sg", "nom", "m1")."""
        return all(any(value in position for position in self.categories) for value in values)


# Thread safety is not documented: one instance per thread (about 0.1 s and tens of MB each).
_local = threading.local()


def _morfeusz() -> Any:
    if not hasattr(_local, "morfeusz"):
        _local.morfeusz = morfeusz2.Morfeusz()
    return _local.morfeusz


def _interpretation(result: tuple[str, str, str, list[str], list[str]]) -> Interpretation:
    orth, lemma, tag, names, _labels = result
    part_of_speech, *categories = tag.split(":")
    return Interpretation(
        orth=orth,
        lemma=lemma,
        part_of_speech=part_of_speech,
        categories=tuple(frozenset(position.split(".")) for position in categories),
        names=frozenset(names),
    )


def analyse_word(word: str) -> list[Interpretation]:
    """Interpretations of a single word; empty when Morfeusz splits it or does not know it."""
    edges = _morfeusz().analyse(word)
    if any(end != 1 for _start, end, _result in edges):
        return []
    found = [_interpretation(result) for _start, _end, result in edges]
    return [item for item in found if item.part_of_speech != "ign"]


def generate(lemma: str) -> list[Interpretation]:
    return [_interpretation(result) for result in _morfeusz().generate(lemma)]


def dictionary_id() -> str:
    dictionary: str = _morfeusz().dict_id()
    return dictionary
