import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import { type TemplateChangeResult, toChangeResult } from "./change-result";
import type { TemplateId } from "../model/template-id";

export async function copyTemplate(id: TemplateId): Promise<TemplateChangeResult> {
  return toChangeResult(await apiFetchOrNull(`/templates/${id}/copy`, { method: "POST" }));
}
