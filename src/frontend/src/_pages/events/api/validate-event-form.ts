import "server-only";

import { z } from "zod";

import type { SaveEventFailure } from "@/entities/event/index.server";

import { failureMessages, FIX_FIELDS } from "../config/messages";
import {
  eventFields,
  type EventFormState,
  type EventFormValues,
  eventFormSchema,
} from "../model/event-form";

type Validated =
  { ok: true; input: z.output<typeof eventFormSchema> } | { ok: false; state: EventFormState };

function formValues(formData: FormData): EventFormValues {
  return Object.fromEntries(
    eventFields.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as EventFormValues;
}

export function validateEventForm(formData: FormData): Validated {
  const values = formValues(formData);
  const parsed = eventFormSchema.safeParse(values);
  if (parsed.success) {
    return { ok: true, input: parsed.data };
  }
  const { fieldErrors } = z.flattenError(parsed.error);
  return {
    ok: false,
    state: {
      status: "error",
      message: FIX_FIELDS,
      fieldErrors: Object.fromEntries(eventFields.map((field) => [field, fieldErrors[field]?.[0]])),
      values,
    },
  };
}

export function saveFailureState(failure: SaveEventFailure, formData: FormData): EventFormState {
  return {
    status: "error",
    message: failureMessages[failure.reason],
    fieldErrors: {},
    values: formValues(formData),
  };
}
