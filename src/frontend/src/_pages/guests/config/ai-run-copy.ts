export const AI_RUN_COPY = {
  choiceTitle: "Sprawdź z AI",
  choiceDescription:
    "AI sprawdzi tytuły, nazwy instytucji i adres oraz zaproponuje zwrot grzecznościowy. Goście z uwagami czekają na Twoje przejrzenie.",
  progress: (done: number, total: number) => `Sprawdzono ${done} z ${total}`,
  progressLabel: "Postęp weryfikacji AI",
  verified: "Bez uwag",
  needsReview: "Do przejrzenia",
  failed: "Nie udało się",
  stop: "Przerwij",
  stopped: "Przerwano.",
  done: "Gotowe.",
  close: "Zamknij",
  nothingToCheck: "Wszyscy goście są już sprawdzeni albo czekają na przejrzenie.",
  queueFailed: "Nie udało się pobrać listy gości. Spróbuj ponownie.",
} as const;
