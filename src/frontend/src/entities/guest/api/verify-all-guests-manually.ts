import "server-only";

import { z } from "zod";

import { apiFetchOrNull, parseResponse } from "@/shared/api/index.server";

import type { GuestId } from "../model/guest-id";

const verifiedCountSchema = z.object({ verified: z.int() });

// Without ids every guest not yet verified; with ids only those of them.
export async function verifyAllGuestsManually(ids?: GuestId[]): Promise<number | null> {
  const response = await apiFetchOrNull("/guests/verification/manual", {
    method: "POST",
    body: JSON.stringify(ids ? { guest_ids: ids } : {}),
  });
  if (!response?.ok) {
    return null;
  }
  return (await parseResponse(response, verifiedCountSchema)).verified;
}
