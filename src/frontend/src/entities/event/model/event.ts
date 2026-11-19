import { type Address, formatAddress } from "@/shared/lib/address";

export type Event = Address & {
  id: number;
  name: string;
  startsAt: string;
  timeZone: string;
  venueName: string | null;
  invitationText: string | null;
  invitationTemplateId: number | null;
  envelopeTemplateId: number | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// A new event: the API fills in the rest, including the system templates.
export type EventDraft = {
  name: string;
  // Wall-clock time as typed, e.g. "2026-10-15T18:00"; the API reads it in the event's zone.
  startsAtLocal: string;
};

export function formatVenue(event: Event): string {
  return [event.venueName, formatAddress(event)].filter(Boolean).join(", ");
}
