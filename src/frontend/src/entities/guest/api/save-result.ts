import type { Guest } from "../model/guest";
import { type GuestDto, toGuest } from "./guest-dto";

export type SaveGuestFailure = { ok: false; reason: "not-found" | "invalid" | "unavailable" };

export type SaveGuestResult = { ok: true; guest: Guest } | SaveGuestFailure;

export async function toSaveResult(response: Response | null): Promise<SaveGuestResult> {
  if (response?.ok) {
    return { ok: true, guest: toGuest((await response.json()) as GuestDto) };
  }
  if (response?.status === 404) {
    return { ok: false, reason: "not-found" };
  }
  if (response?.status === 422) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: false, reason: "unavailable" };
}
