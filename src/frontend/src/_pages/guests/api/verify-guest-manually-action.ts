"use server";

import { revalidatePath } from "next/cache";

import { verifyGuestManually } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";
import { type ActionResult, isRecordId } from "@/shared/lib/actions";

import { VERIFICATION_FAILED } from "../config/verification-messages";

export async function verifyGuestManuallyAction(id: number): Promise<ActionResult> {
  if (!isRecordId(id) || !(await verifyGuestManually(id))) {
    return { error: VERIFICATION_FAILED };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
