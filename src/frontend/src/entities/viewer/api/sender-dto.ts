import { z } from "zod";

import type { SenderInput } from "../model/sender";

export const senderDtoSchema = z
  .object({
    email: z.string().nullable(),
    sender_name: z.string().nullable(),
    street: z.string().nullable(),
    postal_code: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string(),
    sender_complete: z.boolean(),
  })
  .transform((dto) => ({
    email: dto.email,
    senderName: dto.sender_name,
    street: dto.street,
    postalCode: dto.postal_code,
    city: dto.city,
    country: dto.country,
    complete: dto.sender_complete,
  }));

export function toSenderBody(input: SenderInput) {
  return {
    sender_name: input.senderName,
    street: input.street,
    postal_code: input.postalCode,
    city: input.city,
    country: input.country,
  };
}
