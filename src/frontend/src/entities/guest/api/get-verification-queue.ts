import "server-only";

import { z } from "zod";

import { apiFetchOrNull, parseResponse } from "@/shared/api/index.server";

import { guestIdSchema, type GuestId } from "../model/guest-id";

const queueSchema = z.object({ guest_ids: z.array(guestIdSchema) });

// Guests never checked or whose check failed, for checking them one by one; null when unreachable.
export async function getVerificationQueue(): Promise<GuestId[] | null> {
  const response = await apiFetchOrNull("/guests/verification/queue");
  if (!response?.ok) {
    return null;
  }
  return (await parseResponse(response, queueSchema)).guest_ids;
}
