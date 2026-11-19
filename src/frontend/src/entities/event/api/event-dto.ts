import type { Event, EventDraft } from "../model/event";

export type EventDto = {
  id: number;
  name: string;
  starts_at: string;
  timezone: string;
  venue_name: string | null;
  invitation_text: string | null;
  invitation_template_id: number | null;
  envelope_template_id: number | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export function toEvent(dto: EventDto): Event {
  return {
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
  };
}

export function toEventDraftBody(draft: EventDraft) {
  return { name: draft.name, starts_at: draft.startsAtLocal };
}
