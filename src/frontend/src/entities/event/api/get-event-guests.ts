import "server-only";

import { type Page, pageSchema } from "@/shared/api";
import { apiFetch, parseResponse } from "@/shared/api/index.server";
import { withQuery } from "@/shared/routes";

import type { EventGuest } from "../model/event-guest";
import type { EventId } from "../model/event-id";
import { eventGuestDtoSchema } from "./event-guest-dto";

const eventGuestPageSchema = pageSchema(eventGuestDtoSchema);

export async function getEventGuests(
  id: EventId,
  { page }: { page?: number } = {},
): Promise<Page<EventGuest>> {
  const path = withQuery(`/events/${id}/guests`, { page });
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }
  return parseResponse(response, eventGuestPageSchema);
}
