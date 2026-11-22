import { z } from "zod";

import { apiTimestamp } from "@/shared/api";

import { type GuestInput, VERIFICATION_STATUSES } from "../model/guest";
import { guestIdSchema } from "../model/guest-id";

const fieldCheckSchema = z.object({
  status: z.enum(["ok", "warning", "error"]),
  suggestion: z.string().nullable(),
  explanation: z.string(),
});

// What the last AI check said; only the parts the review shows.
const verificationResultSchema = z
  .object({
    checked_at: apiTimestamp,
    fields: z.record(z.string(), fieldCheckSchema).default({}),
    salutation: z.string().nullable().default(null),
    salutation_explanation: z.string().nullable().default(null),
    summary: z.string().nullable().default(null),
    error: z.string().nullable().default(null),
  })
  .transform((result) => ({
    checkedAt: result.checked_at,
    fields: result.fields,
    salutation: result.salutation,
    salutationExplanation: result.salutation_explanation,
    summary: result.summary,
    error: result.error,
  }));

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
    verification_result: verificationResultSchema.nullish().transform((result) => result ?? null),
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
    verificationResult: dto.verification_result,
    verifiedAt: dto.verified_at,
    deletedAt: dto.deleted_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }));

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
