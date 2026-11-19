import "server-only";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { Guest } from "../model/guest";
import { guestListSchema } from "./guest-dto";

export async function getDeletedGuests(): Promise<Guest[]> {
  const response = await apiFetch("/guests?deleted=true");
  if (!response.ok) {
    throw new Error(`GET /guests?deleted=true failed with ${response.status}`);
  }
  return parseResponse(response, guestListSchema);
}
