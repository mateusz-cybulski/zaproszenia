import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

export async function deleteTemplate(id: number): Promise<boolean> {
  const response = await apiFetchOrNull(`/templates/${id}`, { method: "DELETE" });
  return response?.ok === true || response?.status === 404;
}
