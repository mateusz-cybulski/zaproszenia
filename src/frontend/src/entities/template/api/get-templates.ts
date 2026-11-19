import "server-only";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { Template } from "../model/template";
import { templateListSchema } from "./template-dto";

export async function getTemplates(): Promise<Template[]> {
  const response = await apiFetch("/templates");
  if (!response.ok) {
    throw new Error(`GET /templates failed with ${response.status}`);
  }
  return parseResponse(response, templateListSchema);
}
