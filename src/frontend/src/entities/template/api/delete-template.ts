import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";
import type { TemplateId } from "../model/template-id";

export async function deleteTemplate(id: TemplateId): Promise<boolean> {
  const response = await apiFetchOrNull(`/templates/${id}`, { method: "DELETE" });
  return response?.ok === true || response?.status === 404;
}
