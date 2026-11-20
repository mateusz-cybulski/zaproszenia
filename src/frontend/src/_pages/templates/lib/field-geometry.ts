import type { Placeholder, TemplateField } from "@/entities/template";
import { withExamples } from "@/entities/template";

const MM_PER_POINT = 25.4 / 72;
const MIN_FIELD_HEIGHT_MM = 4;
export const MIN_FIELD_WIDTH_MM = 5;
// A field may not start lower than this above the bottom edge, so its frame stays reachable.
export const MIN_ROOM_BELOW_FIELD_MM = 2;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// The API keeps positions to a tenth of a millimetre.
export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

// Roughly how tall a field is, for its frame on the canvas; the preview image shows the real text.
export function estimatedHeightMm(field: TemplateField, placeholders: Placeholder[]): number {
  const text = withExamples(field.content, placeholders);
  const lines = Math.max(1, text.split("\n").filter((line) => line.trim()).length);
  return Math.max(MIN_FIELD_HEIGHT_MM, lines * field.fontSize * field.lineHeight * MM_PER_POINT);
}
