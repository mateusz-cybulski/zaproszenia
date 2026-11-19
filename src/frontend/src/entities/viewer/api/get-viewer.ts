import "server-only";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { Viewer } from "../model/viewer";
import { viewerDtoSchema } from "./viewer-dto";

export async function getViewer(): Promise<Viewer | null> {
  const response = await apiFetch("/auth/me", { onUnauthorized: "return" });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /auth/me failed with ${response.status}`);
  }
  return parseResponse(response, viewerDtoSchema);
}
