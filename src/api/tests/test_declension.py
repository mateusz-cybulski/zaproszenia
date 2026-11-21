import pytest

from app.morphology import dictionary_id
from app.schemas.common import ObliqueCase
from app.services.declension import decline_noun_phrase, decline_person, guest_declension


def test_dictionary_version_is_visible_in_review() -> None:
    # A new SGJP release can change forms: update this together with the lockfile.
    assert dictionary_id() == "pl.sgjp.sgjp-2026.06.01"


@pytest.mark.parametrize(
    ("full_name", "gender", "forms"),
    [
        (
            "Jan Kowalski",
            "m1",
            {"gen": "Jana Kowalskiego", "dat": "Janowi Kowalskiemu", "voc": "Janie Kowalski"},
        ),
        ("Anna Kowalska", "f", {"gen": "Anny Kowalskiej", "inst": "Anną Kowalską"}),
        ("Anna Nowak", "f", {"gen": "Anny Nowak", "dat": "Annie Nowak"}),
        ("Katarzyna Zielińska-Nowak", "f", {"gen": "Katarzyny Zielińskiej-Nowak"}),
        ("prof. dr hab. Jan Nowak", "m1", {"gen": "prof. dr. hab. Jana Nowaka"}),
        ("dr Anna Nowak", "f", {"gen": "dr Anny Nowak"}),
    ],
)
def test_person_names_with_titles(
    full_name: str, gender: str, forms: dict[ObliqueCase, str]
) -> None:
    declined, found_gender = decline_person(full_name)

    assert found_gender == gender
    assert {case: declined[case] for case in forms} == forms


def test_unknown_surname_leaves_the_whole_name_in_the_nominative() -> None:
    declined, gender = decline_person("Grzegorz Brzęczyszczykiewicz")

    assert declined == {}
    assert gender == "m1"


@pytest.mark.parametrize(
    ("text", "gender", "forms"),
    [
        ("Rektor", "m1", {"gen": "Rektora", "dat": "Rektorowi"}),
        ("Dyrektor", "f", {"gen": "Dyrektor", "dat": "Dyrektor"}),
        ("Dyrektor Generalny", "m1", {"dat": "Dyrektorowi Generalnemu"}),
        ("Prezydent Miasta", "m1", {"gen": "Prezydenta Miasta"}),
        ("Muzeum Narodowe w Krakowie", None, {"gen": "Muzeum Narodowego w Krakowie"}),
        ("Urząd Miasta Gdańska", None, {"dat": "Urzędowi Miasta Gdańska"}),
        ("Polska Akademia Nauk", None, {"acc": "Polską Akademię Nauk"}),
        ("Zakłady Mięsne", None, {"gen": "Zakładów Mięsnych"}),
    ],
)
def test_positions_and_institutions(
    text: str, gender: str | None, forms: dict[ObliqueCase, str]
) -> None:
    declined = decline_noun_phrase(text, gender)

    assert {case: declined[case] for case in forms} == forms


def test_guest_position_follows_the_guests_gender() -> None:
    declension = guest_declension("Anna Kowalska", "Dyrektor", "Biblioteka Narodowa")

    assert declension["position"]["dat"] == "Dyrektor"
    assert declension["institution"]["dat"] == "Bibliotece Narodowej"
    assert guest_declension(None, None, "Biblioteka Narodowa")["full_name"] == {}
