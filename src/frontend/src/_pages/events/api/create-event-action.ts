"use server";

import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

import { DEFAULT_TIME_ZONE } from "@/entities/event";
import { createEvent } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";

import { FAILURE_MESSAGES } from "../config/messages";
import { eventFormSchema } from "../model/event-form";

export async function createEventAction(
  _previous: SubmissionResult | undefined,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, { schema: eventFormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const result = await createEvent({ ...submission.value, timeZone: DEFAULT_TIME_ZONE });
  if (!result.ok) {
    return submission.reply({ formErrors: [FAILURE_MESSAGES[result.reason]] });
  }
  revalidatePath(routes.events(), "layout");
  if (result.id !== null) {
    // Straight on to templates and guests; replace, so closing it goes back to the list.
    redirect(routes.event(result.id), RedirectType.replace);
  }
  return submission.reply();
}
