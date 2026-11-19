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

export type GuestInput = Address & {
  fullName: string | null;
  position: string | null;
  institution: string | null;
  salutation: string | null;
};

export function recipientName(guest: Pick<Guest, "fullName" | "institution">): string {
  return guest.fullName ?? guest.institution ?? "";
}
