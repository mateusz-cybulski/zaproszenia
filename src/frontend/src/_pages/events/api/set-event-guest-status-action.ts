"use server";

import { revalidatePath } from "next/cache";

import {
  type EventId,
  INVITATION_STATUSES,
  type InvitationStatus,
  isEventId,
} from "@/entities/event";
import { setEventGuestStatus } from "@/entities/event/index.server";
import { type GuestId, isGuestId } from "@/entities/guest";
import type { ActionResult } from "@/shared/lib/actions";
import { routes } from "@/shared/routes";

import { EVENT_GUESTS_COPY } from "../config/messages";

export async function setEventGuestStatusAction(
  eventId: EventId,
  guestId: GuestId,
  status: InvitationStatus,
): Promise<ActionResult> {
  const valid = isEventId(eventId) && isGuestId(guestId) && INVITATION_STATUSES.includes(status);
  if (!valid || !(await setEventGuestStatus(eventId, guestId, status))) {
    return { error: EVENT_GUESTS_COPY.statusFailed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
