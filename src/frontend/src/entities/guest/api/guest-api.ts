import "server-only";

import { unstable_rethrow } from "next/navigation";

import { apiFetch } from "@/shared/api/index.server";

import type { Guest, GuestInput } from "../model/guest";

type GuestDto = {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
};

export type SaveGuestResult =
  { ok: true; guest: Guest } | { ok: false; reason: "not-found" | "invalid" | "unavailable" };

function toGuest(dto: GuestDto): Guest {
  return { id: dto.id, name: dto.name, email: dto.email, createdAt: dto.created_at };
}

export async function getGuests(): Promise<Guest[]> {
  const response = await apiFetch("/guests");
  if (!response.ok) {
    throw new Error(`GET /guests failed with ${response.status}`);
  }
  const guests = (await response.json()) as GuestDto[];
  return guests.map(toGuest);
}

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

async function save(
  path: string,
  method: "POST" | "PUT",
  input: GuestInput,
): Promise<SaveGuestResult> {
  let response: Response;
  try {
    response = await apiFetch(path, { method, body: JSON.stringify(input) });
  } catch (error) {
    // An expired session redirects to sign-in; only network failures are "unavailable".
    unstable_rethrow(error);
    return { ok: false, reason: "unavailable" };
  }
  if (response.ok) {
    return { ok: true, guest: toGuest((await response.json()) as GuestDto) };
  }
  if (response.status === 404) {
    return { ok: false, reason: "not-found" };
  }
  if (response.status === 422) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: false, reason: "unavailable" };
}

export function createGuest(input: GuestInput): Promise<SaveGuestResult> {
  return save("/guests", "POST", input);
}

export function updateGuest(id: number, input: GuestInput): Promise<SaveGuestResult> {
  return save(`/guests/${id}`, "PUT", input);
}
