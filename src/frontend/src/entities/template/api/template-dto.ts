import { z } from "zod";

import { apiTimestamp } from "@/shared/api";

import { TEMPLATE_KINDS } from "../model/template";

export const templateDtoSchema = z
  .object({
    id: z.int(),
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
