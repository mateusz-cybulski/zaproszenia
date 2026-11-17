import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { Viewer } from "../model/viewer";

/** The signed-in user, or null without a valid session (no session cookie, expired, revoked). */
export async function getViewer(): Promise<Viewer | null> {
  const response = await apiFetch("/auth/me", { onUnauthorized: "return" });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /auth/me failed with ${response.status}`);
  }
  return (await response.json()) as Viewer;
}
