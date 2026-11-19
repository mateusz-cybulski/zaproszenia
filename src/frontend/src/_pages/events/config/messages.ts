import type { SaveEventFailure } from "@/entities/event/index.server";

export const EVENT_DIALOG_COPY = {
  add: {
    title: "Nowe wydarzenie",
    description: "Termin, miejsce i treść zaproszenia. Nowe wydarzenie dostaje szablony systemowe.",
  },
  edit: {
    title: "Edytuj wydarzenie",
    description: "Zmiany trafią na zaproszenia wygenerowane od teraz.",
  },
} as const;

export const EVENT_SECTION_COPY = {
  label: "Sekcja wydarzenia",
  details: "Szczegóły",
  templates: "Szablony",
  guests: "Goście",
  templatesDescription:
    "Podgląd pokazuje to wydarzenie, Twoje dane nadawcy i przykładowego gościa. Zmiana szablonu od razu odświeża podgląd; zapisz, aby ją zachować.",
  templatesSaved: "Zapisano szablony.",
  noTemplate: "Bez szablonu nie wydrukujesz tego dokumentu.",
  guestsSoon: "Lista gości wydarzenia pojawi się w następnym kroku.",
} as const;

export const EVENT_FORM_COPY = {
  place: "Miejsce",
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
