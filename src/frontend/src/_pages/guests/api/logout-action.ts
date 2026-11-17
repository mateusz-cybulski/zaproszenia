"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import { apiFetch, deleteSessionCookie } from "@/shared/api/index.server";
import { routes } from "@/shared/routes";

/** Signs out on every device (the API revokes the sessions) and drops the cookie here. */
export async function logoutAction(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST", onUnauthorized: "return" });
  } catch (error) {
    // The cookie goes away even when the API cannot be reached.
    unstable_rethrow(error);
  }
  await deleteSessionCookie();
  redirect(routes.home());
}
