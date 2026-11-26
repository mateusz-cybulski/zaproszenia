import { plural } from "@/shared/lib/plural";

const GUESTS = { one: "gościa", few: "gości", many: "gości" };

export const SELECTION_COPY = {
  // A sanity cap shared with the API: one request takes at most this many guests.
  maxGuests: 1000,
  toolbarLabel: "Działania na zaznaczonych gościach",
  selected: (count: number) => `Zaznaczono ${plural(count, GUESTS)}`,
  hint: "Zaznacz gości, by działać tylko na nich.",
  selectGuest: (name: string) => `Zaznacz: ${name}`,
  selectPage: "Zaznacz wszystkich na tej stronie",
  tooMany: (max: number) => `Naraz można działać na najwyżej ${max} gościach.`,
  verifyAll: "Zweryfikuj wszystkich",
  verifySelected: "Zweryfikuj zaznaczonych",
  verifyAllDescription: "Wszyscy goście, którzy nie są jeszcze zweryfikowani.",
  verifySelectedDescription: (count: number) => `Zaznaczeni goście (${count}).`,
  addTrigger: "Dodaj do wydarzenia",
  addTitle: "Dodaj do wydarzenia",
  addDescription: (count: number) =>
    `Zaznaczeni goście (${count}) trafią na listę wybranego wydarzenia. Ci, którzy już na niej są, zostaną pominięci.`,
  eventLabel: "Wydarzenie",
  noEvents: "Nie masz jeszcze wydarzeń. Utwórz je w zakładce Wydarzenia.",
  add: "Dodaj",
  adding: "Dodawanie…",
  cancel: "Anuluj",
  added: (eventName: string) => `Dodano do wydarzenia „${eventName}”.`,
  addFailed: "Nie udało się dodać gości do wydarzenia. Spróbuj ponownie.",
  deleteTrigger: "Usuń",
  deleteTitle: "Przenieś do usuniętych",
  deleteDescription: (count: number) =>
    `Zaznaczeni goście (${count}) znikną z listy. Przywrócisz ich przyciskiem „Przywróć” w nagłówku.`,
  delete: "Przenieś do usuniętych",
  deleting: "Przenoszenie…",
  deleteFailed: "Nie udało się usunąć gości. Spróbuj ponownie.",
} as const;
