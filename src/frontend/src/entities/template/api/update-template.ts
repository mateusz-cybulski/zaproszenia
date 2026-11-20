import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { TemplateField } from "../model/template-field";
import type { TemplateId } from "../model/template-id";
import { type TemplateChangeResult, toChangeResult } from "./change-result";
import { toTemplateFieldBody } from "./template-field-dto";

type TemplateChanges = { name?: string; fields?: TemplateField[] };

// The API turns Polish placeholder labels in the content back into their names.
export async function updateTemplate(
  id: TemplateId,
  { name, fields }: TemplateChanges,
): Promise<TemplateChangeResult> {
  const body = JSON.stringify({ name, fields: fields?.map(toTemplateFieldBody) });
  return toChangeResult(await apiFetchOrNull(`/templates/${id}`, { method: "PATCH", body }));
}
