import { z } from "zod";

import { recordIdParamSchema, recordIdSchema } from "@/shared/lib/record-id";

export const templateIdSchema = recordIdSchema.brand<"TemplateId">();

export type TemplateId = z.output<typeof templateIdSchema>;

// The only way to get a TemplateId from outside: an id from the client is checked, never cast.
export function isTemplateId(value: unknown): value is TemplateId {
  return templateIdSchema.safeParse(value).success;
}

export function parseTemplateId(param: string): TemplateId | null {
  const parsed = recordIdParamSchema.pipe(templateIdSchema).safeParse(param);
  return parsed.success ? parsed.data : null;
}
