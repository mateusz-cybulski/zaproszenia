"use server";

import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";

import { type EventId, isEventId } from "@/entities/event";
import { getEvent, updateEvent } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";

import { FAILURE_MESSAGES } from "../config/messages";
import { eventFormSchema } from "../model/event-form";

export async function updateEventAction(
  id: EventId,
  _previous: SubmissionResult | undefined,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, { schema: eventFormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  // The saved event, not the form, supplies the time zone.
  const event = isEventId(id) ? await getEvent(id) : null;
  if (!event) {
    return submission.reply({ formErrors: [FAILURE_MESSAGES["not-found"]] });
  }
  const result = await updateEvent(event.id, { ...submission.value, timeZone: event.timeZone });
  if (!result.ok) {
    return submission.reply({ formErrors: [FAILURE_MESSAGES[result.reason]] });
  }
  revalidatePath(routes.events(), "layout");
  return submission.reply();
}
