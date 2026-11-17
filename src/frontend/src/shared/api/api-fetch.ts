import "server-only";

import { redirect } from "next/navigation";

import { apiUrl } from "@/shared/config/index.server";
import { routes } from "@/shared/routes";

import { readSessionCookie } from "./session-cookie";

type ApiFetchInit = RequestInit & {
  /**
   * What a 401 from the API does. "sign-in" (default) sends the user to the home page, which
   * shows the sign-in form; "return" hands the response back to the caller.
   */
  onUnauthorized?: "sign-in" | "return";
};

/**
 * Calls the API as the signed-in user: the session cookie goes along as a bearer token.
 * Network errors propagate. A redirect is thrown as Next.js does it, so callers that catch
 * errors must let it through with `unstable_rethrow`.
 */
export async function apiFetch(
  path: string,
  { onUnauthorized = "sign-in", ...init }: ApiFetchInit = {},
): Promise<Response> {
  const session = await readSessionCookie();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session) {
    headers.set("Authorization", `Bearer ${session}`);
  }
  const response = await fetch(`${apiUrl()}${path}`, { ...init, headers, cache: "no-store" });
  if (response.status === 401 && onUnauthorized === "sign-in") {
    redirect(routes.home());
  }
  return response;
}
