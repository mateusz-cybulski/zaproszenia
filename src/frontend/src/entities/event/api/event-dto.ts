import { z } from "zod";

import { templateIdSchema } from "@/entities/template/@x/event";
import { apiTimestamp } from "@/shared/api";

import type { EventDraft } from "../model/event";
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

export function toEventDraftBody(draft: EventDraft) {
  return { name: draft.name, starts_at: draft.startsAtLocal };
}
