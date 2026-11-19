"use server";

import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";

import { createGuest } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";

import { FAILURE_MESSAGES } from "../config/guest-form-messages";
import { guestFormSchema } from "../model/guest-form";

export async function createGuestAction(
  _previous: SubmissionResult | undefined,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, { schema: guestFormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const result = await createGuest(submission.value);
  if (!result.ok) {
    return submission.reply({ formErrors: [FAILURE_MESSAGES[result.reason]] });
  }
  revalidatePath(routes.guests(), "layout");
  return submission.reply();
}
