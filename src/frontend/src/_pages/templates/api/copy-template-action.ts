"use server";

import { copyTemplate } from "@/entities/template/index.server";
import type { ActionResult } from "@/shared/lib/actions";

import { NOT_FOUND } from "../config/messages";
import { templateIdSchema } from "../model/template-id";
import { toActionResult } from "./change-result";

export async function copyTemplateAction(id: number): Promise<ActionResult> {
  if (!templateIdSchema.safeParse(id).success) {
    return { error: NOT_FOUND };
  }
  return toActionResult(await copyTemplate(id));
}
