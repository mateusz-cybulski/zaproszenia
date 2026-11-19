import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";
import type { GuestId } from "../model/guest-id";

export async function verifyGuestManually(id: GuestId): Promise<boolean> {
  const response = await apiFetchOrNull(`/guests/${id}/verification/manual`, {
    method: "POST",
    body: "{}",
  });
  return response?.ok ?? false;
}
