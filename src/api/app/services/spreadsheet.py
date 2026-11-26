"""Rows of an uploaded CSV or XLSX file, as lists of strings."""

import csv
import io
from collections.abc import Iterator
from typing import Any

from openpyxl import load_workbook

# Polish Excel saves CSV in Windows-1250 more often than in UTF-8.
CSV_ENCODINGS = ("utf-8-sig", "cp1250")
SNIFF_LINES = 20
SNIFF_CHARS = 8192


class SpreadsheetError(ValueError):
    """The file cannot be read; the message is for the user, in Polish."""


def _decode(content: bytes) -> str:
    for encoding in CSV_ENCODINGS:
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    raise SpreadsheetError(
        "Nie udało się odczytać kodowania pliku (oczekiwano UTF-8 lub Windows-1250)."
    )


def _dialect(text: str) -> Any:
    sample = "\n".join(text.splitlines()[:SNIFF_LINES])[:SNIFF_CHARS]
    try:
        return csv.Sniffer().sniff(sample, delimiters=";,\t")
    except csv.Error:
        # The sniffer gives up on some files: then the delimiter is the one the header line uses
        # most; Polish Excel uses a semicolon.
        header = text.split("\n", 1)[0]

        class Guessed(csv.excel):
            delimiter = max(";,\t", key=header.count)

        return Guessed


def _csv_rows(content: bytes) -> Iterator[list[str]]:
    text = _decode(content)
    reader = csv.reader(io.StringIO(text), _dialect(text))
    try:
        yield from reader
    except csv.Error as error:
        raise SpreadsheetError(f"Błąd w pliku CSV (wiersz {reader.line_num}): {error}") from error


def _xlsx_rows(content: bytes) -> Iterator[list[str]]:
    try:
        workbook = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    except Exception as error:
        raise SpreadsheetError("Nie udało się odczytać pliku XLSX.") from error
    sheet = workbook.active
    if sheet is None:
        raise SpreadsheetError("Plik XLSX nie zawiera arkusza.")
    rows = sheet.iter_rows(values_only=True)
    while True:
        try:
            row = next(rows)
        except StopIteration:
            return
        except Exception as error:
            # A damaged sheet may open and fail only when its rows are read.
            raise SpreadsheetError("Nie udało się odczytać wierszy pliku XLSX.") from error
        yield ["" if cell is None else str(cell) for cell in row]


def read_rows(filename: str, content: bytes) -> Iterator[list[str]]:
    name = filename.lower()
    if name.endswith(".xlsx"):
        return _xlsx_rows(content)
    if name.endswith((".csv", ".txt")):
        return _csv_rows(content)
    raise SpreadsheetError("Obsługiwane formaty to CSV i XLSX.")
