import { z } from "zod";

import { CASES, DATE_FORMATS, DECLINABLE_PLACEHOLDERS } from "../model/template-field";

export const placeholderDtoSchema = z.object({
  name: z.string(),
  label: z.string(),
  group: z.string(),
  description: z.string(),
  example: z.string(),
});

export const dateFormatOptionDtoSchema = z.object({
  value: z.enum(DATE_FORMATS),
  example: z.string(),
});

export const caseOptionDtoSchema = z.object({
  value: z.enum(CASES),
  label: z.string(),
  examples: z.partialRecord(z.enum(DECLINABLE_PLACEHOLDERS), z.string()),
});
