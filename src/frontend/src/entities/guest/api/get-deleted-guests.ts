import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { Guest } from "../model/guest";
import { type GuestDto, toGuest } from "./guest-dto";

export async function getDeletedGuests(): Promise<Guest[]> {
  const response = await apiFetch("/guests?deleted=true");
  if (!response.ok) {
    throw new Error(`GET /guests?deleted=true failed with ${response.status}`);
  }
  return ((await response.json()) as GuestDto[]).map(toGuest);
}
