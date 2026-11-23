import type { AcceptedAiField } from "@/entities/guest";

export const AI_REVIEW_COPY = {
  title: "Wynik weryfikacji AI",
  current: "Obecnie",
  proposed: "Proponowane",
  empty: "(puste)",
  accept: "Przyjmij",
  confirm: "Zatwierdź",
  pending: "Zapisywanie…",
  cancel: "Anuluj",
  addressTitle: "Sprawdzenie adresu",
  addressFound: (label: string) => `Znaleziono: ${label}`,
  noSuggestions: "AI nie proponuje zmian. Zatwierdź, aby oznaczyć gościa jako zweryfikowanego.",
} as const;

export const AI_FIELD_LABELS: Record<AcceptedAiField, string> = {
  full_name: "Imię i nazwisko",
  position: "Stanowisko",
  institution: "Instytucja",
  street: "Ulica i numer",
  postal_code: "Kod pocztowy",
  city: "Miejscowość",
  salutation: "Zwrot grzecznościowy",
};
