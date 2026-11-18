import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { Guest } from "../model/guest";
import { type GuestDto, toGuest } from "./guest-dto";

export async function getGuest(id: number): Promise<Guest | null> {
  const response = await apiFetch(`/guests/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /guests/${id} failed with ${response.status}`);
  }
  return toGuest((await response.json()) as GuestDto);
}
