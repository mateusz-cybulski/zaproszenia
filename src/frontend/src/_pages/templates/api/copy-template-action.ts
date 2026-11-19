"use server";

import { isTemplateId, type TemplateId } from "@/entities/template";
import { copyTemplate } from "@/entities/template/index.server";
import type { ActionResult } from "@/shared/lib/actions";

import { NOT_FOUND } from "../config/messages";
import { toActionResult } from "./change-result";

export async function copyTemplateAction(id: TemplateId): Promise<ActionResult> {
  if (!isTemplateId(id)) {
    return { error: NOT_FOUND };
  }
  return toActionResult(await copyTemplate(id));
}
