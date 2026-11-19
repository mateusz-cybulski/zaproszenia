import "server-only";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { Event } from "../model/event";
import type { EventId } from "../model/event-id";
import { eventDtoSchema } from "./event-dto";

export async function getEvent(id: EventId): Promise<Event | null> {
  const response = await apiFetch(`/events/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /events/${id} failed with ${response.status}`);
  }
  return parseResponse(response, eventDtoSchema);
}
