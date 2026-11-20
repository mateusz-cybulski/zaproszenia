import { z } from "zod";

import {
  ALIGNMENTS,
  CASES,
  DATE_FORMATS,
  DECLINABLE_PLACEHOLDERS,
  FONT_NAMES,
} from "@/entities/template";

import { FIELD_LIMITS } from "../config/field-limits";
import { SAVE_COPY } from "../config/save-copy";
import { MAX_NAME_LENGTH } from "../config/upload";

const fieldSchema = z.object({
  id: z.string().min(1),
  page: z.int().nonnegative(),
  xMm: z.number(),
  yMm: z.number(),
  widthMm: z.number(),
  content: z
    .string()
    .max(FIELD_LIMITS.contentLength)
    .refine((content) => content.trim() !== "", SAVE_COPY.invalidFields),
  font: z.enum(FONT_NAMES),
  fontSize: z.number(),
  align: z.enum(ALIGNMENTS),
  color: z.string(),
  lineHeight: z.number(),
  dateFormat: z.enum(DATE_FORMATS),
  cases: z.partialRecord(z.enum(DECLINABLE_PLACEHOLDERS), z.enum(CASES)),
});

// Ranges and colors are checked by the API; this catches what the editor itself blocks.
export const saveTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, SAVE_COPY.nameEmpty)
    .max(MAX_NAME_LENGTH, SAVE_COPY.nameTooLong(MAX_NAME_LENGTH)),
  fields: z
    .array(fieldSchema, SAVE_COPY.invalidFields)
    .max(FIELD_LIMITS.fieldCount, SAVE_COPY.tooManyFields(FIELD_LIMITS.fieldCount)),
});

export type TemplateDraft = z.input<typeof saveTemplateSchema>;
