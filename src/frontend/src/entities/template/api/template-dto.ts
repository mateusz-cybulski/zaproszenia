import { z } from "zod";

import { apiTimestamp } from "@/shared/api";

import { TEMPLATE_KINDS } from "../model/template";
import { templateIdSchema } from "../model/template-id";
import { templateFieldDtoSchema } from "./template-field-dto";

export const templateDtoSchema = z
  .object({
    id: templateIdSchema,
    kind: z.enum(TEMPLATE_KINDS),
    name: z.string(),
    is_system: z.boolean(),
    has_file: z.boolean(),
    pages: z.array(z.object({ width_mm: z.number(), height_mm: z.number() })),
    fields: z.array(z.unknown()),
    updated_at: apiTimestamp,
  })
  .transform((dto) => ({
    id: dto.id,
    kind: dto.kind,
    name: dto.name,
    isSystem: dto.is_system,
    hasFile: dto.has_file,
    pages: dto.pages.map((page) => ({ widthMm: page.width_mm, heightMm: page.height_mm })),
    fieldCount: dto.fields.length,
    updatedAt: dto.updated_at,
  }));

export const templateListSchema = z.array(templateDtoSchema);

// One template with its fields, for the editor; the list carries only the field count.
export const templateDetailDtoSchema = templateDtoSchema.and(
  z
    .object({ fields: z.array(templateFieldDtoSchema) })
    .transform((dto) => ({ fields: dto.fields })),
);
