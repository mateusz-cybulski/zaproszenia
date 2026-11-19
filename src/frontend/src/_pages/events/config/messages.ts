import type { SaveEventFailure } from "@/entities/event/index.server";

export const EVENT_DIALOG_COPY = {
  add: {
    title: "Nowe wydarzenie",
    description:
      "Termin, miejsce i treść zaproszenia. Po utworzeniu wybierzesz szablony i dodasz gości.",
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
} as const;

export const EVENT_GUESTS_COPY = {
  count: (count: number) => `Gości na liście: ${count}`,
  add: "Dodaj gości",
  addSelected: (count: number) => `Dodaj (${count})`,
  cancel: "Anuluj",
  search: "Szukaj gości",
  selectAll: (count: number) => `Zaznacz widocznych (${count})`,
  noCandidates: "Wszyscy goście z bazy są już na liście albo nikt nie pasuje do wyszukiwania.",
  empty: "Nikt nie jest jeszcze na liście. Dodaj gości z bazy.",
  status: "Status zaproszenia",
  remove: (name: string) => `Zdejmij z listy: ${name}`,
  addFailed: "Nie udało się dodać gości. Spróbuj ponownie.",
  statusFailed: "Nie udało się zmienić statusu. Spróbuj ponownie.",
  removeFailed: "Nie udało się zdjąć gościa z listy. Spróbuj ponownie.",
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
