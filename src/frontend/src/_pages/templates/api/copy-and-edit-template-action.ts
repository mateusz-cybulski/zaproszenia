"use server";

import { revalidatePath } from "next/cache";

import { isTemplateId, type TemplateId } from "@/entities/template";
import { copyTemplate } from "@/entities/template/index.server";
import { routes } from "@/shared/routes";

import { FAILURE_MESSAGES, NOT_FOUND } from "../config/messages";

type CopyAndEditResult = { id: TemplateId } | { error: string };

export async function copyAndEditTemplateAction(id: TemplateId): Promise<CopyAndEditResult> {
  if (!isTemplateId(id)) {
    return { error: NOT_FOUND };
  }
  const result = await copyTemplate(id);
  if (!result.ok) {
    return { error: result.detail ?? FAILURE_MESSAGES[result.reason] };
  }
  revalidatePath(routes.templates());
  return { id: result.id };
}
