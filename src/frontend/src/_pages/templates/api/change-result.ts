import "server-only";

import { revalidatePath } from "next/cache";

import type { TemplateChangeResult } from "@/entities/template/index.server";
import { routes } from "@/shared/routes";

import { failureMessages } from "../config/messages";
import type { ActionResult } from "../model/action-result";

export function toActionResult(result: TemplateChangeResult): ActionResult {
  if (result.ok) {
    revalidatePath(routes.templates());
    return {};
  }
  return { error: result.detail ?? failureMessages[result.reason] };
}
