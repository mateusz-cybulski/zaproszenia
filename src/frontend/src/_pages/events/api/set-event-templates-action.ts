"use server";

import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";

import { type EventId, isEventId } from "@/entities/event";
import { setEventTemplates } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";

import { FAILURE_MESSAGES } from "../config/messages";
import { templateChoiceSchema } from "../model/template-choice-form";

export async function setEventTemplatesAction(
  id: EventId,
  _previous: SubmissionResult | undefined,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, { schema: templateChoiceSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  if (!isEventId(id)) {
    return submission.reply({ formErrors: [FAILURE_MESSAGES["not-found"]] });
  }
  const result = await setEventTemplates(id, submission.value);
  if (!result.ok) {
    return submission.reply({ formErrors: [FAILURE_MESSAGES[result.reason]] });
  }
  revalidatePath(routes.events(), "layout");
  return submission.reply();
}
