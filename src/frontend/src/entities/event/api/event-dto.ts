import { z } from "zod";

import { templateIdSchema } from "@/entities/template/@x/event";
import { apiTimestamp } from "@/shared/api";

import type { EventInput } from "../model/event";
import { eventIdSchema } from "../model/event-id";

export const eventDtoSchema = z
  .object({
    id: eventIdSchema,
    name: z.string(),
    starts_at: apiTimestamp,
    timezone: z.string(),
    venue_name: z.string().nullable(),
    invitation_text: z.string().nullable(),
    invitation_template_id: templateIdSchema.nullable(),
    envelope_template_id: templateIdSchema.nullable(),
    street: z.string().nullable(),
    postal_code: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string(),
    deleted_at: apiTimestamp.nullable(),
    created_at: apiTimestamp,
    updated_at: apiTimestamp,
  })
  .transform((dto) => ({
    id: dto.id,
    name: dto.name,
    startsAt: dto.starts_at,
    timeZone: dto.timezone,
    venueName: dto.venue_name,
    invitationText: dto.invitation_text,
    invitationTemplateId: dto.invitation_template_id,
    envelopeTemplateId: dto.envelope_template_id,
    street: dto.street,
    postalCode: dto.postal_code,
    city: dto.city,
    country: dto.country,
    deletedAt: dto.deleted_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }));

export const eventListSchema = z.array(eventDtoSchema);

export function toEventBody(input: EventInput) {
  return {
    name: input.name,
    starts_at: input.startsAtLocal,
    timezone: input.timeZone,
    venue_name: input.venueName,
    invitation_text: input.invitationText,
    street: input.street,
    postal_code: input.postalCode,
    city: input.city,
    country: input.country,
  };
}
