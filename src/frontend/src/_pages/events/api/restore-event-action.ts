"use server";

import { revalidatePath } from "next/cache";

import { isEventId, type EventId } from "@/entities/event";
import { restoreEvent } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { DELETE_COPY } from "../config/messages";

export async function restoreEventAction(id: EventId): Promise<ActionResult> {
  if (!isEventId(id) || !(await restoreEvent(id))) {
    return { error: DELETE_COPY.restoreFailed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
