import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import { type TemplateChangeResult, toChangeResult } from "./change-result";

export async function copyTemplate(id: number): Promise<TemplateChangeResult> {
  return toChangeResult(await apiFetchOrNull(`/templates/${id}/copy`, { method: "POST" }));
}
