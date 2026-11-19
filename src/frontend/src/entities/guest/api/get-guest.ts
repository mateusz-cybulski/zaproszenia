import "server-only";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { Guest } from "../model/guest";
import { guestDtoSchema } from "./guest-dto";

export async function getGuest(id: number): Promise<Guest | null> {
  const response = await apiFetch(`/guests/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /guests/${id} failed with ${response.status}`);
  }
  return parseResponse(response, guestDtoSchema);
}
