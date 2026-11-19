"use server";

import { revalidatePath } from "next/cache";

import { createEvent } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";

import type { EventFormState } from "../model/event-form";
import { saveFailureState, validateEventForm } from "./validate-event-form";

export async function createEventAction(
  _previous: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const validated = validateEventForm(formData);
  if (!validated.ok) {
    return validated.state;
  }
  const result = await createEvent(validated.input);
  if (!result.ok) {
    return saveFailureState(result, formData);
  }
  revalidatePath(routes.events(), "layout");
  return { status: "success" };
}
