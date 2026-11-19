import "server-only";

import type { GuestId } from "@/entities/guest/@x/event";
import { apiFetchOrNull } from "@/shared/api/index.server";

import type { InvitationStatus } from "../model/event-guest";
import type { EventId } from "../model/event-id";

export async function setEventGuestStatus(
  id: EventId,
  guestId: GuestId,
  status: InvitationStatus,
): Promise<boolean> {
  const response = await apiFetchOrNull(`/events/${id}/guests/${guestId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response?.ok ?? false;
}
