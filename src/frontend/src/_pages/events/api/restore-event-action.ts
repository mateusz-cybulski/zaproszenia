"use server";

import { revalidatePath } from "next/cache";

import { restoreEvent } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";

import { deleteCopy } from "../config/messages";
import { isEventId } from "../model/event-id";

export async function restoreEventAction(id: number): Promise<{ error?: string }> {
  if (!isEventId(id) || !(await restoreEvent(id))) {
    return { error: deleteCopy.restoreFailed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
