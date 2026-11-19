"use server";

import { revalidatePath } from "next/cache";

import { deleteGuest } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";
import { type ActionResult, isRecordId } from "@/shared/lib/actions";

import { DELETE_COPY } from "../config/delete-copy";

export async function deleteGuestAction(id: number, permanent: boolean): Promise<ActionResult> {
  if (!isRecordId(id) || !(await deleteGuest(id, { permanent: permanent === true }))) {
    return { error: DELETE_COPY.failed };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
