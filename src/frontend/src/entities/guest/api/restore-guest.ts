import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

export async function restoreGuest(id: number): Promise<boolean> {
  const response = await apiFetchOrNull(`/guests/${id}/restore`, { method: "POST" });
  return response?.ok ?? false;
}
