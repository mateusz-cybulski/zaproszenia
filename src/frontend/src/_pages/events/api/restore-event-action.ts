"use server";

import { revalidatePath } from "next/cache";

import { restoreEvent } from "@/entities/event/index.server";
import { routes } from "@/shared/routes";
import { type ActionResult, isRecordId } from "@/shared/lib/actions";

import { DELETE_COPY } from "../config/messages";

export async function restoreEventAction(id: number): Promise<ActionResult> {
  if (!isRecordId(id) || !(await restoreEvent(id))) {
    return { error: DELETE_COPY.restoreFailed };
  }
  revalidatePath(routes.events(), "layout");
  return {};
}
