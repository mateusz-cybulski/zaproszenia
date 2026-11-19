import { z } from "zod";

import {
  ALIGNMENTS,
  CASES,
  DATE_FORMATS,
  DECLINABLE_PLACEHOLDERS,
  FONT_NAMES,
  type TemplateField,
} from "../model/template-field";

export const templateFieldDtoSchema = z
  .object({
    id: z.string(),
    page: z.int(),
    x_mm: z.number(),
    y_mm: z.number(),
    width_mm: z.number(),
    content: z.string(),
    font: z.enum(FONT_NAMES),
    font_size: z.number(),
    align: z.enum(ALIGNMENTS),
    color: z.string(),
    line_height: z.number(),
    date_format: z.enum(DATE_FORMATS),
    cases: z.partialRecord(z.enum(DECLINABLE_PLACEHOLDERS), z.enum(CASES)),
  })
  .transform((dto) => ({
    id: dto.id,
    page: dto.page,
    xMm: dto.x_mm,
    yMm: dto.y_mm,
    widthMm: dto.width_mm,
    content: dto.content,
    font: dto.font,
    fontSize: dto.font_size,
    align: dto.align,
    color: dto.color,
    lineHeight: dto.line_height,
    dateFormat: dto.date_format,
    cases: dto.cases,
  }));

export function toTemplateFieldBody(field: TemplateField) {
  return {
    id: field.id,
    page: field.page,
    x_mm: field.xMm,
    y_mm: field.yMm,
    width_mm: field.widthMm,
    content: field.content,
    font: field.font,
    font_size: field.fontSize,
    align: field.align,
    color: field.color,
    line_height: field.lineHeight,
    date_format: field.dateFormat,
    cases: field.cases,
  };
}
