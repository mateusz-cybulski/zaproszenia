import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { GuestInput } from "../model/guest";
import { toGuestBody } from "./guest-dto";
import { type SaveGuestResult, toSaveResult } from "./save-result";

export async function createGuest(input: GuestInput): Promise<SaveGuestResult> {
  const body = JSON.stringify(toGuestBody(input));
  return toSaveResult(await apiFetchOrNull("/guests", { method: "POST", body }));
}
