import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";
import type { GuestId } from "../model/guest-id";

export async function deleteGuest(
  id: GuestId,
  { permanent }: { permanent: boolean },
): Promise<boolean> {
  const query = permanent ? "?permanent=true" : "";
  const response = await apiFetchOrNull(`/guests/${id}${query}`, { method: "DELETE" });
  return response?.ok === true || response?.status === 404;
}
