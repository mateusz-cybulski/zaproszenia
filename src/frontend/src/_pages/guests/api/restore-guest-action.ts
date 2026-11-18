"use server";

import { revalidatePath } from "next/cache";

import { restoreGuest } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";

import { deleteCopy } from "../config/delete-copy";
import { isGuestId } from "../model/guest-id";

export async function restoreGuestAction(id: number): Promise<{ error?: string }> {
  if (!isGuestId(id) || !(await restoreGuest(id))) {
    return { error: deleteCopy.restoreFailed };
  }
  revalidatePath(routes.guests(), "layout");
  return {};
}
