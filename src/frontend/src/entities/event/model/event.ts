import type { z } from "zod";

import type { TemplateId } from "@/entities/template/@x/event";
import { type Address, formatAddress } from "@/shared/lib/address";

import type { eventDtoSchema } from "../api/event-dto";

export const DEFAULT_TIME_ZONE = "Europe/Warsaw";

export type Event = z.output<typeof eventDtoSchema>;

// What the event form sets; templates and guests are chosen separately.
// A row of the events list: the event and how many guests are on its list.
export type EventListItem = Event & { guestCount: number };

export type EventInput = Address & {
  name: string;
  // Wall-clock time as typed, e.g. "2026-10-15T18:00"; the API reads it in the event's zone.
  startsAtLocal: string;
  timeZone: string;
  venueName: string | null;
  invitationText: string | null;
};

export type EventTemplateChoice = {
  invitationTemplateId: TemplateId | null;
  envelopeTemplateId: TemplateId | null;
};

export function formatVenue(event: Event): string {
  return [event.venueName, formatAddress(event)].filter(Boolean).join(", ");
}
