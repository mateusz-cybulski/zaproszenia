import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { Template } from "../model/template";
import { type TemplateDto, toTemplate } from "./template-dto";

export async function getTemplates(): Promise<Template[]> {
  const response = await apiFetch("/templates");
  if (!response.ok) {
    throw new Error(`GET /templates failed with ${response.status}`);
  }
  return ((await response.json()) as TemplateDto[]).map(toTemplate);
}
