"use server";

import { revalidatePath } from "next/cache";

import { type EventId, isEventId } from "@/entities/event";
import { addEventGuests } from "@/entities/event/index.server";
import { type GuestId, isGuestId } from "@/entities/guest";
import type { ActionResult } from "@/shared/lib/actions";
import { routes } from "@/shared/routes";

import { EVENT_GUESTS_COPY } from "../config/messages";

const MAX_GUESTS_PER_REQUEST = 1000;

export async function addEventGuestsAction(
  eventId: EventId,
  guestIds: GuestId[],
): Promise<ActionResult> {
  const valid =
    isEventId(eventId) &&
    Array.isArray(guestIds) &&
    guestIds.length > 0 &&
    guestIds.length <= MAX_GUESTS_PER_REQUEST &&
    guestIds.every(isGuestId);
  if (!valid || !(await addEventGuests(eventId, guestIds))) {
    return { error: EVENT_GUESTS_COPY.addFailed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
