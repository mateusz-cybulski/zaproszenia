"use server";

import { revalidatePath } from "next/cache";

import { verifyAllGuestsManually, verifyGuestManually } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";

const UNAVAILABLE = "Nie udało się zapisać weryfikacji. Spróbuj ponownie.";

export async function verifyGuestManuallyAction(id: number): Promise<{ error?: string }> {
  if (!(await verifyGuestManually(id))) {
    return { error: UNAVAILABLE };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}

export async function verifyAllGuestsManuallyAction(): Promise<{ error?: string }> {
  if ((await verifyAllGuestsManually()) === null) {
    return { error: UNAVAILABLE };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
