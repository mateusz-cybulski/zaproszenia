import "server-only";

import { redirect } from "next/navigation";

import { apiUrl } from "@/shared/config/index.server";
import { routes } from "@/shared/routes";

import { readSessionCookie } from "./session-cookie";

type ApiFetchInit = RequestInit & {
  onUnauthorized?: "sign-in" | "return";
};

// The 401 redirect is thrown, so callers that catch errors must pass it on with
// `unstable_rethrow`.
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
