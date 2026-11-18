import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { Guest } from "../model/guest";
import { type GuestDto, toGuest } from "./guest-dto";

export async function getGuests({ search }: { search?: string } = {}): Promise<Guest[]> {
  const query = search ? `?${new URLSearchParams({ q: search })}` : "";
  const response = await apiFetch(`/guests${query}`);
  if (!response.ok) {
    throw new Error(`GET /guests failed with ${response.status}`);
  }
  return ((await response.json()) as GuestDto[]).map(toGuest);
}
