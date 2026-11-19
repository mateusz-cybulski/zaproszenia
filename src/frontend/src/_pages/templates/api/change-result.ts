import "server-only";

import { revalidatePath } from "next/cache";

import type { TemplateChangeResult } from "@/entities/template/index.server";
import { routes } from "@/shared/routes";
import type { ActionResult } from "@/shared/lib/actions";

import { FAILURE_MESSAGES } from "../config/messages";

export function toActionResult(result: TemplateChangeResult): ActionResult {
  if (result.ok) {
    revalidatePath(routes.templates());
    return {};
  }
  return { error: result.detail ?? FAILURE_MESSAGES[result.reason] };
}
