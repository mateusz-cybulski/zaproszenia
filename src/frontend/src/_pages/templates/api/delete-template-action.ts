"use server";

import { revalidatePath } from "next/cache";

import { deleteTemplate } from "@/entities/template/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { DELETE_FAILED, NOT_FOUND } from "../config/messages";
import { templateIdSchema } from "../model/template-id";

export async function deleteTemplateAction(id: number): Promise<ActionResult> {
  if (!templateIdSchema.safeParse(id).success) {
    return { error: NOT_FOUND };
  }
  if (!(await deleteTemplate(id))) {
    return { error: DELETE_FAILED };
  }
  revalidatePath(routes.templates());
  return {};
}
