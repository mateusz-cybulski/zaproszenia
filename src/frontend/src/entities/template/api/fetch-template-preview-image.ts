import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { TemplateId } from "../model/template-id";

// One page with the editor's unsaved fields, filled with the sample guest. The body is the
// browser's {fields, page} as the API expects it; the API validates it.
export function fetchTemplatePreviewImage(id: TemplateId, body: string): Promise<Response> {
  return apiFetch(`/templates/${id}/preview.png`, {
    method: "POST",
    body,
    onUnauthorized: "return",
  });
}
