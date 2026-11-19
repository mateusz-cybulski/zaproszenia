"use server";

import { revalidatePath } from "next/cache";

import { isGuestId, type GuestId } from "@/entities/guest";
import { restoreGuest } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { DELETE_COPY } from "../config/delete-copy";

export async function restoreGuestAction(id: GuestId): Promise<ActionResult> {
  if (!isGuestId(id) || !(await restoreGuest(id))) {
    return { error: DELETE_COPY.restoreFailed };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
