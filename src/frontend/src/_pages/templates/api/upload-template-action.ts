"use server";

import { z } from "zod";

import { uploadTemplate } from "@/entities/template/index.server";
import type { ActionResult } from "@/shared/lib/actions";

import { INVALID_UPLOAD } from "../config/messages";
import { uploadTemplateSchema } from "../model/upload-template";
import { toActionResult } from "./change-result";

export async function uploadTemplateAction(formData: FormData): Promise<ActionResult> {
  const parsed = uploadTemplateSchema.safeParse({
    name: formData.get("name") ?? "",
    kind: formData.get("kind"),
    file: formData.get("file"),
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { error: fieldErrors.file?.[0] ?? parsed.error.issues[0]?.message ?? INVALID_UPLOAD };
  }
  return toActionResult(await uploadTemplate(parsed.data));
}
