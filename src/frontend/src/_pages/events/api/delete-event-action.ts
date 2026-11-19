"use server";

import { revalidatePath } from "next/cache";

import { deleteEvent } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";
import { type ActionResult, isRecordId } from "@/shared/lib/actions";

import { DELETE_COPY } from "../config/messages";

export async function deleteEventAction(id: number, permanent: boolean): Promise<ActionResult> {
  if (!isRecordId(id) || !(await deleteEvent(id, { permanent: permanent === true }))) {
    return { error: DELETE_COPY.failed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
