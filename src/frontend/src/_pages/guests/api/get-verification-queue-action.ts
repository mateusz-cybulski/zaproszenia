"use server";

import type { GuestId } from "@/entities/guest";
import { getVerificationQueue } from "@/entities/guest/index.server";

import { AI_RUN_COPY } from "../config/ai-run-copy";

export async function getVerificationQueueAction(): Promise<
  { guestIds: GuestId[]; error?: undefined } | { error: string }
> {
  const guestIds = await getVerificationQueue();
  return guestIds ? { guestIds } : { error: AI_RUN_COPY.queueFailed };
}
