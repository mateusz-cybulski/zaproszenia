import "server-only";

import { z } from "zod";

import type { SaveGuestFailure } from "@/entities/guest/index.server";

import { failureMessages, FIX_FIELDS } from "../config/messages";
import {
  guestFields,
  type GuestFormState,
  type GuestFormValues,
  guestFormSchema,
} from "../model/guest-form";

type Validated =
  { ok: true; input: z.output<typeof guestFormSchema> } | { ok: false; state: GuestFormState };

function formValues(formData: FormData): GuestFormValues {
  return Object.fromEntries(
    guestFields.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as GuestFormValues;
}

export function validateGuestForm(formData: FormData): Validated {
  const values = formValues(formData);
  const parsed = guestFormSchema.safeParse(values);
  if (parsed.success) {
    return { ok: true, input: parsed.data };
  }
  const { fieldErrors } = z.flattenError(parsed.error);
  return {
    ok: false,
    state: {
      status: "error",
      message: FIX_FIELDS,
      fieldErrors: Object.fromEntries(guestFields.map((field) => [field, fieldErrors[field]?.[0]])),
      values,
    },
  };
}

export function saveFailureState(failure: SaveGuestFailure, formData: FormData): GuestFormState {
  return {
    status: "error",
    message: failureMessages[failure.reason],
    fieldErrors: {},
    values: formValues(formData),
  };
}
