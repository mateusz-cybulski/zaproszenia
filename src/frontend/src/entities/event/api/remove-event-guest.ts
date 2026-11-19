import "server-only";

import type { GuestId } from "@/entities/guest/@x/event";
import { apiFetchOrNull } from "@/shared/api/index.server";

import type { EventId } from "../model/event-id";

export async function removeEventGuest(id: EventId, guestId: GuestId): Promise<boolean> {
  const response = await apiFetchOrNull(`/events/${id}/guests/${guestId}`, { method: "DELETE" });
  return response?.ok === true || response?.status === 404;
}
