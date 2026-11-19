import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { GuestInput } from "../model/guest";
import { toGuestBody } from "./guest-dto";
import { type SaveGuestResult, toSaveResult } from "./save-result";
import type { GuestId } from "../model/guest-id";

export async function updateGuest(id: GuestId, input: GuestInput): Promise<SaveGuestResult> {
  const body = JSON.stringify(toGuestBody(input));
  return toSaveResult(await apiFetchOrNull(`/guests/${id}`, { method: "PUT", body }));
}
