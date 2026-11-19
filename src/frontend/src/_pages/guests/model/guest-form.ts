import { z } from "zod";

import type { Guest } from "@/entities/guest";
import { TEXT_LIMIT } from "@/shared/config";
import { addressSchemaShape, optionalText } from "@/shared/lib/forms";

export const RECIPIENT_REQUIRED =
  "Podaj imię i nazwisko albo instytucję (np. redakcję zapraszaną jako całość).";

export const guestFormSchema = z
  .object({
    fullName: optionalText(TEXT_LIMIT.short),
    position: optionalText(TEXT_LIMIT.short),
    institution: optionalText(TEXT_LIMIT.short),
    salutation: optionalText(TEXT_LIMIT.short),
    ...addressSchemaShape,
  })
  .refine((guest) => guest.fullName !== null || guest.institution !== null, {
    message: RECIPIENT_REQUIRED,
    path: ["fullName"],
  });

export type GuestField = keyof z.input<typeof guestFormSchema>;

export function guestFormDefaults(guest?: Guest) {
  return {
    fullName: guest?.fullName ?? "",
    position: guest?.position ?? "",
    institution: guest?.institution ?? "",
    salutation: guest?.salutation ?? "",
    street: guest?.street ?? "",
    postalCode: guest?.postalCode ?? "",
    city: guest?.city ?? "",
    country: guest?.country ?? "PL",
  };
}
