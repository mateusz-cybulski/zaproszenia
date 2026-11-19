"use server";

import { revalidatePath } from "next/cache";

import { verifyAllGuestsManually } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { VERIFICATION_FAILED } from "../config/verification-messages";

export async function verifyAllGuestsManuallyAction(): Promise<ActionResult> {
  if ((await verifyAllGuestsManually()) === null) {
    return { error: VERIFICATION_FAILED };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
