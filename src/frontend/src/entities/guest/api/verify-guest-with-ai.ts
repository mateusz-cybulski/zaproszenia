import "server-only";

import { apiFetchOrNull, parseResponse } from "@/shared/api/index.server";

import type { Guest } from "../model/guest";
import type { GuestId } from "../model/guest-id";
import { guestDtoSchema } from "./guest-dto";

// The guest with the stored result, or null when the API could not be reached.
export async function verifyGuestWithAi(id: GuestId): Promise<Guest | null> {
  const response = await apiFetchOrNull(`/guests/${id}/verification/ai`, {
    method: "POST",
    body: "{}",
  });
  if (!response?.ok) {
    return null;
  }
  return parseResponse(response, guestDtoSchema);
}
