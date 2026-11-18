import "server-only";

import { unstable_rethrow } from "next/navigation";

import { apiFetch } from "@/shared/api/index.server";

import type { Guest, GuestInput, VerificationStatus } from "../model/guest";

type GuestDto = {
  id: number;
  full_name: string | null;
  position: string | null;
  institution: string | null;
  salutation: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  verification_status: VerificationStatus;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveGuestResult =
  { ok: true; guest: Guest } | { ok: false; reason: "not-found" | "invalid" | "unavailable" };

function toGuest(dto: GuestDto): Guest {
  return {
    id: dto.id,
    fullName: dto.full_name,
    position: dto.position,
    institution: dto.institution,
    salutation: dto.salutation,
    street: dto.street,
    postalCode: dto.postal_code,
    city: dto.city,
    country: dto.country,
    verificationStatus: dto.verification_status,
    verifiedAt: dto.verified_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function toDto(input: GuestInput) {
  return {
    full_name: input.fullName,
    position: input.position,
    institution: input.institution,
    salutation: input.salutation,
    street: input.street,
    postal_code: input.postalCode,
    city: input.city,
    country: input.country,
  };
}

export async function getGuests({ search }: { search?: string } = {}): Promise<Guest[]> {
  const query = search ? `?${new URLSearchParams({ q: search })}` : "";
  const response = await apiFetch(`/guests${query}`);
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
    response = await apiFetch(path, { method, body: JSON.stringify(toDto(input)) });
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

async function post(path: string, body?: unknown): Promise<Response | null> {
  try {
    return await apiFetch(path, { method: "POST", body: JSON.stringify(body ?? {}) });
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}

export async function verifyGuestManually(id: number): Promise<boolean> {
  const response = await post(`/guests/${id}/verification/manual`);
  return response?.ok ?? false;
}

export async function verifyAllGuestsManually(): Promise<number | null> {
  const response = await post("/guests/verification/manual");
  if (!response?.ok) {
    return null;
  }
  return ((await response.json()) as { verified: number }).verified;
}
