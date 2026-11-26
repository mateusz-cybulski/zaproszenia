import type { SaveEventFailure } from "@/entities/event/index.server";

export const EVENT_DIALOG_COPY = {
  add: { title: "Nowe wydarzenie", submit: "Utwórz", pending: "Tworzenie…" },
  edit: {
    title: "Edytuj wydarzenie",
    submit: "Zapisz",
    pending: "Zapisywanie…",
    saved: "Zapisano.",
  },
} as const;

export const EVENT_SECTION_COPY = {
  label: "Sekcja wydarzenia",
  details: "Szczegóły",
  templates: "Szablony",
  guests: "Goście",
  templatesDescription:
    "Podgląd pokazuje to wydarzenie, Twoje dane nadawcy i przykładowego gościa. Zmiana szablonu od razu odświeża podgląd; „Zapisz” w nagłówku ją zachowa.",
  noTemplate: "Bez szablonu nie wydrukujesz tego dokumentu.",
} as const;

export const EVENT_GUESTS_COPY = {
  count: (count: number) => `Gości na liście: ${count}`,
  add: "Dodaj gości",
  addSelected: (count: number) => `Dodaj (${count})`,
  cancel: "Anuluj",
  search: "Szukaj gości",
  selectAll: (count: number) => `Zaznacz widocznych (${count})`,
  addAllMatching: (count: number) => `Dodaj wszystkich pasujących (${count})`,
  showMore: (shown: number, total: number) => `Pokaż więcej (${shown} z ${total})`,
  loading: "Wczytywanie…",
  searchFailed: "Nie udało się wczytać gości. Spróbuj ponownie.",
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

export const EVENT_DOCUMENTS_COPY = {
  label: "Do druku",
  invitation: "Zaproszenia (PDF)",
  envelope: "Koperty (PDF)",
  generating: "Generowanie…",
  menuTooltip: "Zaproszenia albo koperty dla wszystkich gości (PDF)",
  fileName: (kind: "invitation" | "envelope", eventName: string) =>
    `${kind === "invitation" ? "Zaproszenia" : "Koperty"} – ${eventName.replace(/[\\/:*?"<>|]/g, "-")}.pdf`,
  noGuests: "Najpierw dodaj gości do wydarzenia.",
  noTemplate: (kind: "invitation" | "envelope") =>
    `Wybierz szablon ${kind === "invitation" ? "zaproszenia" : "koperty"} w sekcji „Szablony”.`,
  failed: "Nie udało się wygenerować pliku. Spróbuj ponownie.",
  confirmTitle: "Wygenerować mimo braków?",
  confirmDescription: "Plik powstanie, ale sprawdź, czy to Ci nie przeszkadza:",
  unverified: (count: number) => `Niezweryfikowani goście: ${count}. Ich dane mogą zawierać błędy.`,
  senderIncomplete:
    "Brakuje danych nadawcy (nazwy i adresu w Ustawieniach), więc nie będzie ich na zaproszeniach i kopertach.",
  confirm: "Generuj mimo to",
  cancel: "Wróć",
  unsavedTitle: "Masz niezapisane zmiany",
  unsavedDescription:
    "Plik powstaje z zapisanych danych wydarzenia i wybranych szablonów. Zapisać zmiany przed generowaniem?",
  saveAndGenerate: "Zapisz i generuj",
  generateWithoutSaving: "Generuj bez zapisywania",
} as const;
