"use server";

import { revalidatePath } from "next/cache";

import { isEventId, type EventId } from "@/entities/event";
import { deleteEvent } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { DELETE_COPY } from "../config/messages";

export async function deleteEventAction(id: EventId, permanent: boolean): Promise<ActionResult> {
  if (!isEventId(id) || !(await deleteEvent(id, { permanent: permanent === true }))) {
    return { error: DELETE_COPY.failed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
