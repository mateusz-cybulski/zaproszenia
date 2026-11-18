import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

export async function verifyGuestManually(id: number): Promise<boolean> {
  const response = await apiFetchOrNull(`/guests/${id}/verification/manual`, {
    method: "POST",
    body: "{}",
  });
  return response?.ok ?? false;
}
