"use server";

import { revalidatePath } from "next/cache";

import { restoreGuest } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";
import { type ActionResult, isRecordId } from "@/shared/lib/actions";

import { DELETE_COPY } from "../config/delete-copy";

export async function restoreGuestAction(id: number): Promise<ActionResult> {
  if (!isRecordId(id) || !(await restoreGuest(id))) {
    return { error: DELETE_COPY.restoreFailed };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
