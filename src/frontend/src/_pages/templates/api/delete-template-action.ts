"use server";

import { revalidatePath } from "next/cache";

import { isTemplateId, type TemplateId } from "@/entities/template";
import { deleteTemplate } from "@/entities/template/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { DELETE_FAILED, NOT_FOUND } from "../config/messages";

export async function deleteTemplateAction(id: TemplateId): Promise<ActionResult> {
  if (!isTemplateId(id)) {
    return { error: NOT_FOUND };
  }
  if (!(await deleteTemplate(id))) {
    return { error: DELETE_FAILED };
  }
  revalidatePath(routes.templates());
  return {};
}
