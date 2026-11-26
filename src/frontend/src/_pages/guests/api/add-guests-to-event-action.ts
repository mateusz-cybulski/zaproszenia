"use server";

import { revalidatePath } from "next/cache";

import { type EventId, isEventId } from "@/entities/event";
import { addEventGuests } from "@/entities/event/index.server";
import type { GuestId } from "@/entities/guest";
import type { ActionResult } from "@/shared/lib/actions";
import { routes } from "@/shared/routes";

import { SELECTION_COPY } from "../config/selection-copy";
import { isGuestSelection } from "../model/guest-selection";

export async function addGuestsToEventAction(
  eventId: EventId,
  guestIds: GuestId[],
): Promise<ActionResult> {
  if (!isEventId(eventId) || !isGuestSelection(guestIds)) {
    return { error: SELECTION_COPY.addFailed };
  }
  if (!(await addEventGuests(eventId, guestIds))) {
    return { error: SELECTION_COPY.addFailed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
