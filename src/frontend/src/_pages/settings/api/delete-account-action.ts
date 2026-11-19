"use server";

import { redirect } from "next/navigation";

import { deleteAccount } from "@/entities/viewer/index.server";
import { deleteSessionCookie } from "@/shared/api/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { DELETE_CONFIRMATION, SETTINGS_MESSAGES } from "../config/messages";

export async function deleteAccountAction(confirmation: string): Promise<ActionResult> {
  if (confirmation !== DELETE_CONFIRMATION) {
    return { error: SETTINGS_MESSAGES.deleteFailed };
  }
  const result = await deleteAccount();
  if (result === "account-kept") {
    return { error: SETTINGS_MESSAGES.accountKept };
  }
  if (result === "unavailable") {
    return { error: SETTINGS_MESSAGES.deleteFailed };
  }
  await deleteSessionCookie();
  redirect(routes.home());
}
