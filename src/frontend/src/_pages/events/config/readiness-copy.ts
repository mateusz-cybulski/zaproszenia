import { plural } from "@/shared/lib/plural";

export const READINESS_COPY = {
  title: "Przed drukiem",
  noGuests: "Na liście nie ma jeszcze gości.",
  addGuests: "Dodaj gości",
  noInvitationTemplate: "Brak szablonu zaproszenia.",
  noEnvelopeTemplate: "Brak szablonu koperty.",
  chooseTemplate: "Wybierz szablon",
  unverified: (count: number) =>
    `${plural(count, { one: "gość nie jest zweryfikowany", few: "goście nie są zweryfikowani", many: "gości nie jest zweryfikowanych" })}.`,
  withoutAddress: (count: number) =>
    `${plural(count, { one: "gość nie ma pełnego adresu", few: "goście nie mają pełnego adresu", many: "gości nie ma pełnego adresu" })} (potrzebny na kopercie).`,
  openGuests: "Przejdź do gości",
  senderIncomplete: "Dane nadawcy są niepełne (potrzebne na kopercie).",
  openSettings: "Uzupełnij w ustawieniach",
} as const;
