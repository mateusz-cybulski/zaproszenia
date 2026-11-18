"use server";

import { revalidatePath } from "next/cache";

import { verifyAllGuestsManually } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";

import { VERIFICATION_FAILED } from "../config/messages";

export async function verifyAllGuestsManuallyAction(): Promise<{ error?: string }> {
  if ((await verifyAllGuestsManually()) === null) {
    return { error: VERIFICATION_FAILED };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
