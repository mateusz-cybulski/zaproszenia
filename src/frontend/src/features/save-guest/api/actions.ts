"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createGuest, type SaveGuestResult, updateGuest } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";

import { type GuestFormState, guestFormSchema } from "../model/guest-form";

const failureMessages: Record<Exclude<SaveGuestResult, { ok: true }>["reason"], string> = {
  "not-found": "Ten gość już nie istnieje.",
  invalid: "API odrzuciło dane. Sprawdź pola formularza.",
  unavailable: "Nie udało się połączyć z API. Spróbuj ponownie.",
};

type Validated =
  { ok: true; input: z.output<typeof guestFormSchema> } | { ok: false; state: GuestFormState };

function validate(formData: FormData): Validated {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  const parsed = guestFormSchema.safeParse(values);
  if (parsed.success) {
    return { ok: true, input: parsed.data };
  }
  const { fieldErrors } = z.flattenError(parsed.error);
  return {
    ok: false,
    state: {
      status: "error",
      message: "Popraw zaznaczone pola.",
      fieldErrors: { name: fieldErrors.name?.[0], email: fieldErrors.email?.[0] },
      values,
    },
  };
}

function failure(
  result: Exclude<SaveGuestResult, { ok: true }>,
  formData: FormData,
): GuestFormState {
  return {
    status: "error",
    message: failureMessages[result.reason],
    fieldErrors: {},
    values: {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
    },
  };
}

export async function createGuestAction(
  _previous: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  const validated = validate(formData);
  if (!validated.ok) {
    return validated.state;
  }
  const result = await createGuest(validated.input);
  if (!result.ok) {
    return failure(result, formData);
  }
  revalidatePath(routes.home());
  return { status: "success" };
}

export async function updateGuestAction(
  id: number,
  _previous: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  const validated = validate(formData);
  if (!validated.ok) {
    return validated.state;
  }
  const result = await updateGuest(id, validated.input);
  if (!result.ok) {
    return failure(result, formData);
  }
  revalidatePath(routes.home());
  redirect(routes.home());
}
