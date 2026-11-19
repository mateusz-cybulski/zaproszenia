import "server-only";

import { apiFetch } from "@/shared/api/index.server";
import type { TemplateId } from "../model/template-id";

export type TemplateAsset = "page.png" | "preview";

export function fetchTemplateAsset(id: TemplateId, asset: TemplateAsset): Promise<Response> {
  return apiFetch(`/templates/${id}/${asset}`, { onUnauthorized: "return" });
}
