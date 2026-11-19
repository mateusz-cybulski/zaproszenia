"use server";

import { revalidatePath } from "next/cache";

import { type EventId, isEventId } from "@/entities/event";
import { removeEventGuest } from "@/entities/event/index.server";
import { type GuestId, isGuestId } from "@/entities/guest";
import type { ActionResult } from "@/shared/lib/actions";
import { routes } from "@/shared/routes";

import { EVENT_GUESTS_COPY } from "../config/messages";

export async function removeEventGuestAction(
  eventId: EventId,
  guestId: GuestId,
): Promise<ActionResult> {
  if (!isEventId(eventId) || !isGuestId(guestId) || !(await removeEventGuest(eventId, guestId))) {
    return { error: EVENT_GUESTS_COPY.removeFailed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
