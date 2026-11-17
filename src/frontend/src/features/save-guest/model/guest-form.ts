import { z } from "zod";

import type { Guest } from "@/entities/guest";
import { countryCodes } from "@/shared/config";

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Maksymalnie ${max} znaków.`)
    .transform((value) => value || null);
}

export const RECIPIENT_REQUIRED =
  "Podaj imię i nazwisko albo instytucję (np. redakcję zapraszaną jako całość).";

export const guestFields = [
  "fullName",
  "position",
  "institution",
  "salutation",
  "street",
  "postalCode",
  "city",
  "country",
] as const;
export type GuestField = (typeof guestFields)[number];

export const guestFormSchema = z
  .object({
    fullName: optionalText(300),
    position: optionalText(300),
    institution: optionalText(300),
    salutation: optionalText(300),
    street: optionalText(300),
    postalCode: optionalText(20),
    city: optionalText(200),
    country: z.string().refine((code) => countryCodes.includes(code), "Wybierz kraj z listy."),
  })
  .refine((guest) => guest.fullName !== null || guest.institution !== null, {
    message: RECIPIENT_REQUIRED,
    path: ["fullName"],
  });

export type GuestFormValues = Record<GuestField, string>;

export function initialGuestFormValues(guest?: Guest): GuestFormValues {
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

export type GuestFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<GuestField, string>>;
      values: GuestFormValues;
    };

export const initialGuestFormState: GuestFormState = { status: "idle" };
