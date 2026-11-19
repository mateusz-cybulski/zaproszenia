"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateSender } from "@/entities/viewer/index.server";
import { routes } from "@/shared/routes";

import { settingsMessages } from "../config/messages";
import {
  senderFields,
  type SenderFormState,
  type SenderFormValues,
  senderFormSchema,
} from "../model/sender-form";

function formValues(formData: FormData): SenderFormValues {
  return Object.fromEntries(
    senderFields.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as SenderFormValues;
}

export async function updateSenderAction(
  _previous: SenderFormState,
  formData: FormData,
): Promise<SenderFormState> {
  const values = formValues(formData);
  const parsed = senderFormSchema.safeParse(values);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      status: "error",
      message: settingsMessages.fixFields,
      fieldErrors: Object.fromEntries(
        senderFields.map((field) => [field, fieldErrors[field]?.[0]]),
      ),
      values,
    };
  }
  const result = await updateSender(parsed.data);
  if (result !== "saved") {
    return { status: "error", message: settingsMessages[result], fieldErrors: {}, values };
  }
  revalidatePath(routes.settings());
  return { status: "saved", values };
}
