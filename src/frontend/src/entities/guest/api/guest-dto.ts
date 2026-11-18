import type { Guest, GuestInput, VerificationStatus } from "../model/guest";

export type GuestDto = {
  id: number;
  full_name: string | null;
  position: string | null;
  institution: string | null;
  salutation: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  verification_status: VerificationStatus;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export function toGuest(dto: GuestDto): Guest {
  return {
    id: dto.id,
    fullName: dto.full_name,
    position: dto.position,
    institution: dto.institution,
    salutation: dto.salutation,
    street: dto.street,
    postalCode: dto.postal_code,
    city: dto.city,
    country: dto.country,
    verificationStatus: dto.verification_status,
    verifiedAt: dto.verified_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function toGuestBody(input: GuestInput) {
  return {
    full_name: input.fullName,
    position: input.position,
    institution: input.institution,
    salutation: input.salutation,
    street: input.street,
    postal_code: input.postalCode,
    city: input.city,
    country: input.country,
  };
}
