import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

export async function deleteEvent(
  id: number,
  { permanent }: { permanent: boolean },
): Promise<boolean> {
  const query = permanent ? "?permanent=true" : "";
  const response = await apiFetchOrNull(`/events/${id}${query}`, { method: "DELETE" });
  return response?.ok === true || response?.status === 404;
}
