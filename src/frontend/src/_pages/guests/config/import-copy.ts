export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;
export const IMPORT_ACCEPT = ".csv,.xlsx,.txt";
const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".txt"];

export function hasImportExtension(name: string): boolean {
  return ALLOWED_EXTENSIONS.some((extension) => name.toLowerCase().endsWith(extension));
}

export const IMPORT_COPY = {
  trigger: "Importuj",
  title: "Import gości z arkusza",
  description:
    "Plik CSV albo XLSX, do 2 MB i 2000 gości. Pierwszy wiersz to nagłówki kolumn, np. „Imię i nazwisko”, „Instytucja”, „Ulica i numer”, „Kod pocztowy”, „Miejscowość”.",
  fileLabel: "Plik z gośćmi",
  check: "Sprawdź plik",
  checking: "Sprawdzanie…",
  save: (count: number) => `Importuj ${count} ${count === 1 ? "gościa" : "gości"}`,
  saving: "Importowanie…",
  cancel: "Anuluj",
  ready: "Do dodania",
  duplicates: "Już na liście (pomijani)",
  errors: "Z błędami (pomijani)",
  skippedColumns: (names: string) => `Nierozpoznane kolumny, pominięte: ${names}.`,
  row: (row: number) => `Wiersz ${row}`,
  moreErrors: (count: number) => `…i ${count} więcej.`,
  previewCaption: (shown: number, total: number) =>
    shown < total ? `Podgląd pierwszych ${shown} z ${total} gości do dodania` : "Goście do dodania",
  recipient: "Adresat",
  affiliation: "Stanowisko i instytucja",
  address: "Adres",
  noFile: "Wybierz plik CSV albo XLSX.",
  wrongType: "Obsługiwane formaty to CSV i XLSX.",
  tooLarge: "Plik jest za duży (najwyżej 2 MB).",
  failed: "Nie udało się sprawdzić pliku. Spróbuj ponownie.",
} as const;
