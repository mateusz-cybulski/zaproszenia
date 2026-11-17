import type { VerificationStatus } from "../model/guest";

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  pending: "Do weryfikacji",
  verified_ai: "Zweryfikowany (AI)",
  verified_manual: "Zweryfikowany",
  needs_review: "Wymaga przejrzenia",
  failed: "Błąd weryfikacji",
};
