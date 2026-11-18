"use server";

import { revalidatePath } from "next/cache";

import { verifyGuestManually } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";

import { VERIFICATION_FAILED } from "../config/verification-messages";

export async function verifyGuestManuallyAction(id: number): Promise<{ error?: string }> {
  if (!(await verifyGuestManually(id))) {
    return { error: VERIFICATION_FAILED };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
