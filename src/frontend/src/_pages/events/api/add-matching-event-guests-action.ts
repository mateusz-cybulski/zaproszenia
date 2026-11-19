"use server";

import { revalidatePath } from "next/cache";

import { type EventId, isEventId } from "@/entities/event";
import { addMatchingEventGuests } from "@/entities/event/index.server";
import { SEARCH_MAX_LENGTH } from "@/shared/config";
import type { ActionResult } from "@/shared/lib/actions";
import { routes } from "@/shared/routes";

import { EVENT_GUESTS_COPY } from "../config/messages";

export async function addMatchingEventGuestsAction(
  eventId: EventId,
  search: string,
): Promise<ActionResult> {
  const valid =
    isEventId(eventId) && typeof search === "string" && search.length <= SEARCH_MAX_LENGTH;
  if (!valid || !(await addMatchingEventGuests(eventId, search.trim()))) {
    return { error: EVENT_GUESTS_COPY.addFailed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
