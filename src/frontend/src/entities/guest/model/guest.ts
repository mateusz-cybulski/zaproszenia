import type { z } from "zod";

import type { Address } from "@/shared/lib/address";

import type { guestDtoSchema } from "../api/guest-dto";

export const VERIFICATION_STATUSES = [
  "pending",
  "verified_ai",
  "verified_manual",
  "needs_review",
  "failed",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export type Guest = z.output<typeof guestDtoSchema>;
export type VerificationResult = NonNullable<Guest["verificationResult"]>;
export type FieldCheck = VerificationResult["fields"][string];

// The fields AI may correct, by their API names, and the salutation it proposes.
export const AI_CHECKED_FIELDS = [
  "full_name",
  "position",
  "institution",
  "street",
  "postal_code",
  "city",
] as const;
export type AiCheckedField = (typeof AI_CHECKED_FIELDS)[number];
export type AcceptedAiField = AiCheckedField | "salutation";

export type GuestInput = Address & {
  fullName: string | null;
  position: string | null;
  institution: string | null;
  salutation: string | null;
};

export function recipientName(guest: Pick<Guest, "fullName" | "institution">): string {
  return guest.fullName ?? guest.institution ?? "";
}

// Guests saved before the address became required may lack it; an envelope needs all three.
export function hasPostalAddress(guest: Pick<Guest, "street" | "postalCode" | "city">): boolean {
  return Boolean(guest.street && guest.postalCode && guest.city);
}
