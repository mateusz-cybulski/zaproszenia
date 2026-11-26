"use server";

import { revalidatePath } from "next/cache";

import type { GuestId } from "@/entities/guest";
import { verifyAllGuestsManually } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { VERIFICATION_FAILED } from "../config/verification-messages";
import { isGuestSelection } from "../model/guest-selection";

// An empty list means every guest not yet verified.
export async function verifyAllGuestsManuallyAction(ids: GuestId[]): Promise<ActionResult> {
  if (!Array.isArray(ids) || (ids.length > 0 && !isGuestSelection(ids))) {
    return { error: VERIFICATION_FAILED };
  }
  if ((await verifyAllGuestsManually(ids.length > 0 ? ids : undefined)) === null) {
    return { error: VERIFICATION_FAILED };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
