import "server-only";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { EventGuest } from "../model/event-guest";
import type { EventId } from "../model/event-id";
import { eventGuestListSchema } from "./event-guest-dto";

export async function getEventGuests(id: EventId): Promise<EventGuest[]> {
  const response = await apiFetch(`/events/${id}/guests`);
  if (!response.ok) {
    throw new Error(`GET /events/${id}/guests failed with ${response.status}`);
  }
  return parseResponse(response, eventGuestListSchema);
}
