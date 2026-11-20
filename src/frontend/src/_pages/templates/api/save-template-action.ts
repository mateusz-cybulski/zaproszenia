"use server";

import { isTemplateId, type TemplateId } from "@/entities/template";
import { updateTemplate } from "@/entities/template/index.server";
import type { ActionResult } from "@/shared/lib/actions";

import { NOT_FOUND } from "../config/messages";
import { SAVE_COPY } from "../config/save-copy";
import { saveTemplateSchema, type TemplateDraft } from "../model/save-template";
import { toActionResult } from "./change-result";

export async function saveTemplateAction(
  id: TemplateId,
  draft: TemplateDraft,
): Promise<ActionResult> {
  if (!isTemplateId(id)) {
    return { error: NOT_FOUND };
  }
  const parsed = saveTemplateSchema.safeParse(draft);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? SAVE_COPY.invalidFields };
  }
  const result = await updateTemplate(id, parsed.data);
  if (!result.ok && result.reason === "invalid") {
    return { error: result.detail ?? SAVE_COPY.invalidFields };
  }
  return toActionResult(result);
}
