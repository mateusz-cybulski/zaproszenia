import io
from typing import Any

from httpx import AsyncClient
from openpyxl import Workbook

from app.routers import guests as guests_router
from tests.conftest import ADDRESS, OTHER_SESSION_COOKIE

HEADER = "Imię i nazwisko;Stanowisko;Instytucja;Ulica i numer;Kod pocztowy;Miejscowość;Uwagi"
ANNA = "dr Anna Nowak;Dyrektor;Muzeum Narodowe;ul. Długa 1;00-001;Warszawa;VIP"
JAN = "Jan Kowalski;;;ul. Krótka 2;31-007;Kraków;"


def _csv(*lines: str, encoding: str = "utf-8") -> bytes:
    return "\n".join(lines).encode(encoding)


async def _import(
    client: AsyncClient, content: bytes, name: str = "goscie.csv", dry_run: bool = True
) -> Any:
    return await client.post(
        "/guests/import",
        params={"dry_run": str(dry_run).lower()},
        files={"file": (name, content, "application/octet-stream")},
    )


async def test_dry_run_maps_columns_checks_rows_and_saves_nothing(client: AsyncClient) -> None:
    no_address = "Piotr Lis;;;;;;"
    response = await _import(client, _csv(HEADER, ANNA, "", JAN, no_address))

    assert response.status_code == 200
    result = response.json()
    assert (result["total_rows"], result["ready"], result["created"]) == (3, 2, 0)
    assert result["mapped_columns"]["Imię i nazwisko"] == "full_name"
    assert result["unmapped_columns"] == ["Uwagi"]
    assert result["errors"] == [
        {
            "row": 5,
            "errors": [
                "Ulica i numer: brak wartości.",
                "Kod pocztowy: brak wartości.",
                "Miejscowość: brak wartości.",
            ],
        }
    ]
    assert [guest["full_name"] for guest in result["preview"]] == ["dr Anna Nowak", "Jan Kowalski"]
    assert (await client.get("/guests")).json()["items"] == []


async def test_import_saves_valid_new_guests_with_declension(client: AsyncClient) -> None:
    response = await _import(client, _csv(HEADER, ANNA, JAN), dry_run=False)

    assert response.json()["created"] == 2
    guests = (await client.get("/guests")).json()["items"]
    assert {guest["full_name"] for guest in guests} == {"dr Anna Nowak", "Jan Kowalski"}
    jan = next(guest for guest in guests if guest["full_name"] == "Jan Kowalski")
    assert jan["declension"]["full_name"]["dat"] == "Janowi Kowalskiemu"
    assert jan["verification_status"] == "pending"


async def test_duplicates_of_existing_guests_and_within_the_file_are_skipped(
    client: AsyncClient,
) -> None:
    await client.post("/guests", json={**ADDRESS, "full_name": "Jan  kowalski"})

    result = (await _import(client, _csv(HEADER, ANNA, JAN, ANNA), dry_run=False)).json()

    assert result["created"] == 1
    assert [duplicate["row"] for duplicate in result["duplicates"]] == [3, 4]


async def test_another_owners_guests_are_not_duplicates(client: AsyncClient) -> None:
    other = {"Authorization": f"Bearer {OTHER_SESSION_COOKIE}"}
    await client.post("/guests", json={**ADDRESS, "full_name": "Jan Kowalski"}, headers=other)

    result = (await _import(client, _csv(HEADER, JAN))).json()

    assert (result["ready"], result["duplicates"]) == (1, [])


async def test_windows_1250_csv_with_commas_and_english_headers(client: AsyncClient) -> None:
    content = _csv(
        "Full name,Institution,Street,Postal code,City",
        "Łukasz Żak,Teatr Śląski,ul. Zielona 3,40-001,Katowice",
        encoding="cp1250",
    )

    result = (await _import(client, content)).json()

    assert result["preview"][0]["full_name"] == "Łukasz Żak"
    assert result["preview"][0]["city"] == "Katowice"


async def test_xlsx(client: AsyncClient) -> None:
    workbook = Workbook()
    sheet = workbook.active
    assert sheet is not None
    sheet.append(["Instytucja", "Ulica", "Kod", "Miasto"])
    sheet.append(["Redakcja Gazety", "ul. Prasowa 1", "00-002", "Warszawa"])
    buffer = io.BytesIO()
    workbook.save(buffer)

    result = (await _import(client, buffer.getvalue(), name="goscie.xlsx", dry_run=False)).json()

    assert result["created"] == 1
    assert result["preview"][0]["institution"] == "Redakcja Gazety"


async def test_unreadable_files_are_rejected_with_a_reason(client: AsyncClient) -> None:
    unknown_columns = await _import(client, _csv("A;B", "1;2"))
    wrong_type = await _import(client, b"%PDF-1.7", name="goscie.pdf")
    broken_xlsx = await _import(client, b"not a zip", name="goscie.xlsx")

    assert unknown_columns.status_code == 422
    assert "Nie rozpoznano żadnej kolumny" in unknown_columns.json()["detail"]
    assert wrong_type.status_code == 422
    assert broken_xlsx.status_code == 422


async def test_limits_on_size_and_rows(client: AsyncClient, monkeypatch: Any) -> None:
    monkeypatch.setattr(guests_router, "IMPORT_MAX_ROWS", 2)
    too_many = await _import(client, _csv(HEADER, ANNA, JAN, ANNA.replace("Anna", "Ewa")))
    monkeypatch.setattr(guests_router, "IMPORT_MAX_BYTES", 10)
    too_large = await _import(client, _csv(HEADER, ANNA))

    assert too_many.status_code == 422
    assert "więcej niż 2 gości" in too_many.json()["detail"]
    assert too_large.status_code == 413


async def test_import_requires_sign_in(anonymous_client: AsyncClient) -> None:
    response = await _import(anonymous_client, _csv(HEADER, ANNA))

    assert response.status_code == 401
