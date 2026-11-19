import { PAPER_SIZE_TOLERANCE_MM, PAPER_SIZES } from "../config/paper-sizes";
import type { TemplatePage } from "../model/template";

function matches(actualMm: number, expectedMm: number): boolean {
  return Math.abs(actualMm - expectedMm) <= PAPER_SIZE_TOLERANCE_MM;
}

export function pageSizeLabel({ widthMm, heightMm }: TemplatePage): string {
  const [shorter, longer] = [Math.min(widthMm, heightMm), Math.max(widthMm, heightMm)];
  const paper = PAPER_SIZES.find(
    (size) => matches(shorter, size.widthMm) && matches(longer, size.heightMm),
  );
  const millimetres = `${Math.round(widthMm)} × ${Math.round(heightMm)} mm`;
  if (!paper) {
    return millimetres;
  }
  const orientation = widthMm > heightMm ? " poziomo" : "";
  return `${paper.name}${orientation}, ${millimetres}`;
}
