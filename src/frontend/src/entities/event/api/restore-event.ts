import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";
import type { EventId } from "../model/event-id";

export async function restoreEvent(id: EventId): Promise<boolean> {
  const response = await apiFetchOrNull(`/events/${id}/restore`, { method: "POST" });
  return response?.ok ?? false;
}
