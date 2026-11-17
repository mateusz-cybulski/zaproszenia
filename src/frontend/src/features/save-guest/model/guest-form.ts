import { z } from "zod";

export const guestFormSchema = z.object({
  name: z.string().trim().min(1, "Podaj imię i nazwisko.").max(200, "Maksymalnie 200 znaków."),
  email: z
    .union([z.literal(""), z.email("Podaj poprawny adres e-mail.").max(320)])
    .transform((email) => email || null),
});

export type GuestFormValues = { name: string; email: string };

export type GuestFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<keyof GuestFormValues, string>>;
      values: GuestFormValues;
    };

export const initialGuestFormState: GuestFormState = { status: "idle" };
