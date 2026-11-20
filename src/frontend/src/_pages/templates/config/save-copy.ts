export const SAVE_COPY = {
  save: "Zapisz",
  saving: "Zapisywanie…",
  saved: "Zmiany zapisane.",
  saveFailed: "Nie udało się zapisać szablonu",
  emptyFields: (count: number) =>
    count === 1
      ? "Jedno pole jest puste. Uzupełnij je albo usuń, żeby zapisać."
      : `Puste pola: ${count}. Uzupełnij je albo usuń, żeby zapisać.`,
  emptyField: "Puste pole",
  name: "Nazwa szablonu",
  nameEmpty: "Nazwa nie może być pusta.",
  nameTooLong: (max: number) => `Maksymalnie ${max} znaków.`,
  tooManyFields: (max: number) => `Szablon może mieć najwyżej ${max} pól.`,
  invalidFields: "Sprawdź pola szablonu.",
  copyAndEdit: "Kopiuj i edytuj",
  copying: "Kopiowanie…",
  discardTitle: "Porzucić niezapisane zmiany?",
  discardDescription: "Zmiany w polach i nazwie szablonu nie zostały zapisane.",
  keepEditing: "Wróć do edycji",
  discard: "Porzuć zmiany",
} as const;
