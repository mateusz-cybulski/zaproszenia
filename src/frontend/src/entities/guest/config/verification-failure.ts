import type { VerificationFailure, VerificationResult } from "../model/guest";

const REASONS: Record<VerificationFailure, string> = {
  credentials: "Aplikacja nie ma teraz dostępu do usługi AI. To problem po naszej stronie.",
  rate_limited: "Usługa AI dostała zbyt wiele zapytań naraz. Odczekaj minutę i spróbuj ponownie.",
  timeout: "Usługa AI nie odpowiedziała na czas. Spróbuj ponownie.",
  service: "Usługa AI zgłosiła błąd. Spróbuj ponownie za chwilę.",
  connection: "Nie udało się połączyć z usługą AI. Spróbuj ponownie.",
  invalid_answer: "AI zwróciło odpowiedź, której nie da się odczytać. Spróbuj ponownie.",
};

const UNKNOWN_REASON = "Nie udało się zapytać AI. Spróbuj ponownie za chwilę.";

// The reason a failed check gives the user; checks stored before the codes have the text only.
export function verificationFailureReason(result: VerificationResult | null): string {
  if (result?.failure) {
    return REASONS[result.failure];
  }
  return result?.error ?? UNKNOWN_REASON;
}
