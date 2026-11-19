"use server";

import { copyTemplate } from "@/entities/template/index.server";
import { type ActionResult, isRecordId } from "@/shared/lib/actions";

import { NOT_FOUND } from "../config/messages";
import { toActionResult } from "./change-result";

export async function copyTemplateAction(id: number): Promise<ActionResult> {
  if (!isRecordId(id)) {
    return { error: NOT_FOUND };
  }
  return toActionResult(await copyTemplate(id));
}
