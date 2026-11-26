"use server";

import { revalidatePath } from "next/cache";

import type { GuestId } from "@/entities/guest";
import { deleteGuests } from "@/entities/guest/index.server";
import type { ActionResult } from "@/shared/lib/actions";
import { routes } from "@/shared/routes";

import { SELECTION_COPY } from "../config/selection-copy";
import { isGuestSelection } from "../model/guest-selection";

export async function deleteGuestsAction(ids: GuestId[]): Promise<ActionResult> {
  if (!isGuestSelection(ids) || !(await deleteGuests(ids))) {
    return { error: SELECTION_COPY.deleteFailed };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
