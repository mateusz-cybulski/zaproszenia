import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";
import type { GuestId } from "../model/guest-id";

export async function restoreGuest(id: GuestId): Promise<boolean> {
  const response = await apiFetchOrNull(`/guests/${id}/restore`, { method: "POST" });
  return response?.ok ?? false;
}
