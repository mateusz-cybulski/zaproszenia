"use server";

import { revalidatePath } from "next/cache";

import { isGuestId, type GuestId, verificationFailureReason } from "@/entities/guest";
import { verifyGuestWithAi } from "@/entities/guest/index.server";
import type { ActionResult } from "@/shared/lib/actions";
import { routes } from "@/shared/routes";

import { AI_VERIFICATION_FAILED } from "../config/verification-messages";

export async function verifyGuestWithAiAction(id: GuestId): Promise<ActionResult> {
  if (!isGuestId(id)) {
    return { error: AI_VERIFICATION_FAILED };
  }
  const guest = await verifyGuestWithAi(id);
  revalidatePath(routes.guests(), "layout");
  if (!guest) {
    return { error: AI_VERIFICATION_FAILED };
  }
  if (guest.verificationStatus === "failed") {
    return { error: verificationFailureReason(guest.verificationResult) };
  }
  return {};
}
