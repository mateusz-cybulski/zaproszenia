import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { EventId } from "../model/event-id";

// Every guest matching the search who is not on the list yet, however many pages they span.
export async function addMatchingEventGuests(id: EventId, search: string): Promise<boolean> {
  const body = JSON.stringify({ q: search || null });
  const response = await apiFetchOrNull(`/events/${id}/guests/matching`, { method: "POST", body });
  return response?.ok ?? false;
}
