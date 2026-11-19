"use server";

import { revalidatePath } from "next/cache";

import { isGuestId, type GuestId } from "@/entities/guest";
import { verifyGuestManually } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { VERIFICATION_FAILED } from "../config/verification-messages";

export async function verifyGuestManuallyAction(id: GuestId): Promise<ActionResult> {
  if (!isGuestId(id) || !(await verifyGuestManually(id))) {
    return { error: VERIFICATION_FAILED };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
