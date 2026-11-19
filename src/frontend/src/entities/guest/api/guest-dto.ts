import { z } from "zod";

import { apiTimestamp } from "@/shared/api";

import { type GuestInput, VERIFICATION_STATUSES } from "../model/guest";
import { guestIdSchema } from "../model/guest-id";

export const guestDtoSchema = z
  .object({
    id: guestIdSchema,
    full_name: z.string().nullable(),
    position: z.string().nullable(),
    institution: z.string().nullable(),
    salutation: z.string().nullable(),
    street: z.string().nullable(),
    postal_code: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string(),
    verification_status: z.enum(VERIFICATION_STATUSES),
    verified_at: apiTimestamp.nullable(),
    deleted_at: apiTimestamp.nullable(),
    created_at: apiTimestamp,
    updated_at: apiTimestamp,
  })
  .transform((dto) => ({
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
    deletedAt: dto.deleted_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }));

export const guestListSchema = z.array(guestDtoSchema);

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
