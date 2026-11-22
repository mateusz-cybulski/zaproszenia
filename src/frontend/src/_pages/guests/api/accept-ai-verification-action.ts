"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AI_CHECKED_FIELDS, isGuestId, type AcceptedAiField, type GuestId } from "@/entities/guest";
import { acceptAiVerification } from "@/entities/guest/index.server";
import type { ActionResult } from "@/shared/lib/actions";
import { routes } from "@/shared/routes";

import { VERIFICATION_FAILED } from "../config/verification-messages";

const acceptedSchema = z.array(z.enum([...AI_CHECKED_FIELDS, "salutation"])).max(7);

export async function acceptAiVerificationAction(
  id: GuestId,
  accepted: AcceptedAiField[],
): Promise<ActionResult> {
  const parsed = acceptedSchema.safeParse(accepted);
  if (!isGuestId(id) || !parsed.success || !(await acceptAiVerification(id, parsed.data))) {
    return { error: VERIFICATION_FAILED };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
