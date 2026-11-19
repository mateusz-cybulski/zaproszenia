import type { SaveEventFailure } from "@/entities/event/index.server";

export const EVENT_DIALOG_COPY = {
  title: "Nowe wydarzenie",
  description: "Miejsce, treść zaproszenia i szablony uzupełnisz w szczegółach wydarzenia.",
} as const;

export const FAILURE_MESSAGES: Record<SaveEventFailure["reason"], string> = {
  "not-found": "To wydarzenie już nie istnieje.",
  invalid: "API odrzuciło dane. Sprawdź pola formularza.",
  unavailable: "Nie udało się połączyć z API. Spróbuj ponownie.",
};

export const DELETE_COPY = {
  description: "Wybierz, czy wydarzenie ma trafić do usuniętych, czy zniknąć na stałe.",
  softTitle: "Przenieś do usuniętych",
  softDescription:
    "Wydarzenie zniknie z listy razem z listą gości. Przywrócisz je przyciskiem „Przywróć” w nagłówku.",
  permanentTitle: "Usuń na stałe",
  permanentDescription:
    "Wydarzenie i jego lista gości zostaną usunięte. Goście zostają w bazie gości.",
  failed: "Nie udało się usunąć wydarzenia. Spróbuj ponownie.",
  restoreFailed: "Nie udało się przywrócić wydarzenia. Spróbuj ponownie.",
} as const;
