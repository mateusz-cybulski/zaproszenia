import { z } from "zod";

import type { Sender } from "@/entities/viewer";
import { TextLimit } from "@/shared/config";
import { addressSchemaShape, optionalText } from "@/shared/lib/forms";

export const senderFields = ["senderName", "street", "postalCode", "city", "country"] as const;
export type SenderField = (typeof senderFields)[number];
export type SenderFormValues = Record<SenderField, string>;

export const senderFormSchema = z.object({
  senderName: optionalText(TextLimit.short),
  ...addressSchemaShape,
});

export function initialSenderFormValues(sender: Sender): SenderFormValues {
  return {
    senderName: sender.senderName ?? "",
    street: sender.street ?? "",
    postalCode: sender.postalCode ?? "",
    city: sender.city ?? "",
    country: sender.country,
  };
}

export type SenderFormState =
  | { status: "idle" }
  | { status: "saved"; values: SenderFormValues }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<SenderField, string>>;
      values: SenderFormValues;
    };
