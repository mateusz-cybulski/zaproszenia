import "server-only";

import type { GuestId } from "@/entities/guest/@x/event";
import { apiFetchOrNull } from "@/shared/api/index.server";

import type { EventId } from "../model/event-id";

export async function addEventGuests(id: EventId, guestIds: GuestId[]): Promise<boolean> {
  const body = JSON.stringify({ guest_ids: guestIds });
  const response = await apiFetchOrNull(`/events/${id}/guests`, { method: "POST", body });
  return response?.ok ?? false;
}
