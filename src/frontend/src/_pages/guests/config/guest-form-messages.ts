import type { SaveGuestFailure } from "@/entities/guest/index.server";

export const FAILURE_MESSAGES: Record<SaveGuestFailure["reason"], string> = {
  "not-found": "Ten gość już nie istnieje.",
  invalid: "API odrzuciło dane. Sprawdź pola formularza.",
  unavailable: "Nie udało się połączyć z API. Spróbuj ponownie.",
};
