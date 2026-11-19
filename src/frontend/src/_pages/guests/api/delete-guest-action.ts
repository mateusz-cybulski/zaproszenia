"use server";

import { revalidatePath } from "next/cache";

import { isGuestId, type GuestId } from "@/entities/guest";
import { deleteGuest } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { DELETE_COPY } from "../config/delete-copy";

export async function deleteGuestAction(id: GuestId, permanent: boolean): Promise<ActionResult> {
  if (!isGuestId(id) || !(await deleteGuest(id, { permanent: permanent === true }))) {
    return { error: DELETE_COPY.failed };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
