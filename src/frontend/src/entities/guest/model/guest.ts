import type { Address } from "@/shared/lib/address";

export type VerificationStatus =
  "pending" | "verified_ai" | "verified_manual" | "needs_review" | "failed";

export type Guest = Address & {
  id: number;
  fullName: string | null;
  position: string | null;
  institution: string | null;
  salutation: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GuestInput = Address & {
  fullName: string | null;
  position: string | null;
  institution: string | null;
  salutation: string | null;
};

export function recipientName(guest: Pick<Guest, "fullName" | "institution">): string {
  return guest.fullName ?? guest.institution ?? "";
}
