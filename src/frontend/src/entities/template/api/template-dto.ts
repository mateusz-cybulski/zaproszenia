import type { Template, TemplateKind } from "../model/template";

export type TemplateDto = {
  id: number;
  kind: TemplateKind;
  name: string;
  is_system: boolean;
  has_file: boolean;
  pages: { width_mm: number; height_mm: number }[];
  fields: unknown[];
  updated_at: string;
};

export function toTemplate(dto: TemplateDto): Template {
  return {
    id: dto.id,
    kind: dto.kind,
    name: dto.name,
    isSystem: dto.is_system,
    hasFile: dto.has_file,
    pages: dto.pages.map((page) => ({ widthMm: page.width_mm, heightMm: page.height_mm })),
    fieldCount: dto.fields.length,
    updatedAt: dto.updated_at,
  };
}
