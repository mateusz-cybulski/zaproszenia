import type { SaveGuestFailure } from "@/entities/guest/index.server";

export const failureMessages: Record<SaveGuestFailure["reason"], string> = {
  "not-found": "Ten gość już nie istnieje.",
  invalid: "API odrzuciło dane. Sprawdź pola formularza.",
  unavailable: "Nie udało się połączyć z API. Spróbuj ponownie.",
};

export const FIX_FIELDS = "Popraw zaznaczone pola.";
