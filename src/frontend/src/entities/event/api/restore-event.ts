import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

export async function restoreEvent(id: number): Promise<boolean> {
  const response = await apiFetchOrNull(`/events/${id}/restore`, { method: "POST" });
  return response?.ok ?? false;
}
