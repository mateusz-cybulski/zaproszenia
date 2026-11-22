import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { AcceptedAiField } from "../model/guest";
import type { GuestId } from "../model/guest-id";

export async function acceptAiVerification(
  id: GuestId,
  accepted: AcceptedAiField[],
): Promise<boolean> {
  const response = await apiFetchOrNull(`/guests/${id}/verification/ai/accept`, {
    method: "POST",
    body: JSON.stringify({ accept: accepted }),
  });
  return response?.ok ?? false;
}
