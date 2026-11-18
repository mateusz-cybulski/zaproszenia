"use server";

import { revalidatePath } from "next/cache";

import { createGuest } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";

import type { GuestFormState } from "../model/guest-form";
import { saveFailureState, validateGuestForm } from "./validate-guest-form";

export async function createGuestAction(
  _previous: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  const validated = validateGuestForm(formData);
  if (!validated.ok) {
    return validated.state;
  }
  const result = await createGuest(validated.input);
  if (!result.ok) {
    return saveFailureState(result, formData);
  }
  revalidatePath(routes.guests(), "layout");
  return { status: "success" };
}
