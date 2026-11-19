import { z } from "zod";

import type { Sender } from "@/entities/viewer";
import { TEXT_LIMIT } from "@/shared/config";
import { addressSchemaShape, optionalText } from "@/shared/lib/forms";

export const senderFormSchema = z.object({
  senderName: optionalText(TEXT_LIMIT.short),
  ...addressSchemaShape,
});

export type SenderField = keyof z.input<typeof senderFormSchema>;

export function senderFormDefaults(sender: Sender) {
  return {
    senderName: sender.senderName ?? "",
    street: sender.street ?? "",
    postalCode: sender.postalCode ?? "",
    city: sender.city ?? "",
    country: sender.country,
  };
}
