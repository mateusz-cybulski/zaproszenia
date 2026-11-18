"use server";

import { revalidatePath } from "next/cache";

import { deleteGuest } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";

import { deleteCopy } from "../config/delete-copy";
import { isGuestId } from "../model/guest-id";

export async function deleteGuestAction(
  id: number,
  permanent: boolean,
): Promise<{ error?: string }> {
  if (!isGuestId(id) || !(await deleteGuest(id, { permanent: permanent === true }))) {
    return { error: deleteCopy.failed };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
