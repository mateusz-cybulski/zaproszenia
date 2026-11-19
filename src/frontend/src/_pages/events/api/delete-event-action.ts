"use server";

import { revalidatePath } from "next/cache";

import { deleteEvent } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";

import { deleteCopy } from "../config/messages";
import { isEventId } from "../model/event-id";

export async function deleteEventAction(
  id: number,
  permanent: boolean,
): Promise<{ error?: string }> {
  if (!isEventId(id) || !(await deleteEvent(id, { permanent: permanent === true }))) {
    return { error: deleteCopy.failed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
