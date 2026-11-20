import {
  type Placeholder,
  type TemplateField,
  type TemplatePage,
  toDisplay,
} from "@/entities/template";

import type { FieldPreset } from "../config/field-presets";
import { roundToTenth } from "../lib/field-geometry";

// A preset placed centred on the page, 70% of its width, a little above the middle.
export function newField(
  preset: FieldPreset,
  page: TemplatePage,
  pageIndex: number,
  placeholders: Placeholder[],
): TemplateField {
  const widthMm = roundToTenth(page.widthMm * 0.7);
  return {
    id: crypto.randomUUID(),
    page: pageIndex,
    xMm: roundToTenth((page.widthMm - widthMm) / 2),
    yMm: roundToTenth(page.heightMm * 0.4),
    widthMm,
    content: toDisplay(preset.content, placeholders),
    font: preset.font,
    fontSize: preset.fontSize,
    align: "center",
    color: "#1a1a1a",
    lineHeight: 1.3,
    dateFormat: "long",
    cases: {},
  };
}
