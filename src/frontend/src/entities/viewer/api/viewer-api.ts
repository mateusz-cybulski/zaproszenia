import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { Viewer } from "../model/viewer";

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

// For pages without an API call of their own: the layout's session check runs only on a
// full page load, not on link navigation.
export async function requireViewer(): Promise<Viewer> {
  const response = await apiFetch("/auth/me"); // a 401 redirects to sign-in
  if (!response.ok) {
    throw new Error(`GET /auth/me failed with ${response.status}`);
  }
  return (await response.json()) as Viewer;
}
