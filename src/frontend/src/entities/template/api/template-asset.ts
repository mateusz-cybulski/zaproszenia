import "server-only";

import { apiFetch } from "@/shared/api/index.server";

export type TemplateAsset = "page.png" | "preview";

export function fetchTemplateAsset(id: number, asset: TemplateAsset): Promise<Response> {
  return apiFetch(`/templates/${id}/${asset}`, { onUnauthorized: "return" });
}
