import { countryName } from "@/shared/config";

export type VerificationStatus =
  "pending" | "verified_ai" | "verified_manual" | "needs_review" | "failed";

export type Address = {
  street: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
};

export type Guest = Address & {
  id: number;
  fullName: string | null;
  position: string | null;
  institution: string | null;
  salutation: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
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

export function formatAddress(address: Address): string {
  const place = [address.postalCode, address.city].filter(Boolean).join(" ");
  const country = address.country === "PL" ? null : countryName(address.country);
  return [address.street, place, country].filter(Boolean).join(", ");
}
