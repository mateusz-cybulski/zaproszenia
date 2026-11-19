"use server";

import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";

import { updateSender } from "@/entities/viewer/index.server";
import { routes } from "@/shared/routes";

import { SETTINGS_MESSAGES } from "../config/messages";
import { senderFormSchema } from "../model/sender-form";

export async function updateSenderAction(
  _previous: SubmissionResult | undefined,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, { schema: senderFormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const result = await updateSender(submission.value);
  if (result !== "saved") {
    return submission.reply({ formErrors: [SETTINGS_MESSAGES[result]] });
  }
  revalidatePath(routes.settings());
  return submission.reply();
}
