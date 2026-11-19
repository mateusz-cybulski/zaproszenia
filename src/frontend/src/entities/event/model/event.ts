import type { z } from "zod";

import { formatAddress } from "@/shared/lib/address";

import type { eventDtoSchema } from "../api/event-dto";

export type Event = z.output<typeof eventDtoSchema>;

// A new event: the API fills in the rest, including the system templates.
export type EventDraft = {
  name: string;
  // Wall-clock time as typed, e.g. "2026-10-15T18:00"; the API reads it in the event's zone.
  startsAtLocal: string;
};

export function formatVenue(event: Event): string {
  return [event.venueName, formatAddress(event)].filter(Boolean).join(", ");
}
