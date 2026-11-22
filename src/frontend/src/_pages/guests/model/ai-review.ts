import {
  AI_CHECKED_FIELDS,
  type AcceptedAiField,
  type FieldCheck,
  type Guest,
} from "@/entities/guest";

export type AiReviewRow = {
  field: AcceptedAiField;
  current: string | null;
  proposed: string | null;
  status: FieldCheck["status"];
  explanation: string | null;
};

const CURRENT_VALUE: Record<(typeof AI_CHECKED_FIELDS)[number], (guest: Guest) => string | null> = {
  full_name: (guest) => guest.fullName,
  position: (guest) => guest.position,
  institution: (guest) => guest.institution,
  street: (guest) => guest.street,
  postal_code: (guest) => guest.postalCode,
  city: (guest) => guest.city,
};

// Only what AI remarks on: fields with a warning, an error or a suggestion, and a new salutation.
export function aiReviewRows(guest: Guest): AiReviewRow[] {
  const result = guest.verificationResult;
  if (!result) {
    return [];
  }
  const rows: AiReviewRow[] = [];
  for (const field of AI_CHECKED_FIELDS) {
    const check = result.fields[field];
    if (check && (check.status !== "ok" || check.suggestion !== null)) {
      rows.push({
        field,
        current: CURRENT_VALUE[field](guest),
        proposed: check.suggestion,
        status: check.status,
        explanation: check.explanation,
      });
    }
  }
  if (result.salutation && result.salutation !== guest.salutation) {
    rows.push({
      field: "salutation",
      current: guest.salutation,
      proposed: result.salutation,
      status: "warning",
      explanation: result.salutationExplanation,
    });
  }
  return rows;
}
