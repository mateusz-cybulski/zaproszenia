import "server-only";

import { z } from "zod";

import { apiFetchOrNull } from "@/shared/api/index.server";

import { type TemplateId, templateIdSchema } from "../model/template-id";
import { type TemplateChangeFailure, toChangeResult } from "./change-result";

const copyDtoSchema = z.object({ id: templateIdSchema });

export type TemplateCopyResult = { ok: true; id: TemplateId } | TemplateChangeFailure;

export async function copyTemplate(id: TemplateId): Promise<TemplateCopyResult> {
  const response = await apiFetchOrNull(`/templates/${id}/copy`, { method: "POST" });
  const result = await toChangeResult(response);
  if (!result.ok) {
    return result;
  }
  const body = copyDtoSchema.safeParse(await response?.json().catch(() => null));
  return body.success ? { ok: true, id: body.data.id } : { ok: false, reason: "unavailable" };
}
