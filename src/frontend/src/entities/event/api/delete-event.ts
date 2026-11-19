import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";
import type { EventId } from "../model/event-id";

export async function deleteEvent(
  id: EventId,
  { permanent }: { permanent: boolean },
): Promise<boolean> {
  const query = permanent ? "?permanent=true" : "";
  const response = await apiFetchOrNull(`/events/${id}${query}`, { method: "DELETE" });
  return response?.ok === true || response?.status === 404;
}
