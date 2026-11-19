import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { TemplateId } from "../model/template-id";

export function fetchSavedTemplatePreviewImage(id: TemplateId): Promise<Response> {
  return apiFetch(`/templates/${id}/preview.png`, { onUnauthorized: "return" });
}
