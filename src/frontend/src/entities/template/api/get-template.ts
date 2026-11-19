import "server-only";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { TemplateDetail } from "../model/template";
import type { TemplateId } from "../model/template-id";
import { templateDetailDtoSchema } from "./template-dto";

export async function getTemplate(id: TemplateId): Promise<TemplateDetail | null> {
  const response = await apiFetch(`/templates/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /templates/${id} failed with ${response.status}`);
  }
  return parseResponse(response, templateDetailDtoSchema);
}
