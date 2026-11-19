"use client";

import type { TemplateField, TemplatePage } from "@/entities/template";

import { FIELD_LIMITS } from "../config/field-limits";
import { INSPECTOR_COPY } from "../config/inspector-copy";
import { MIN_FIELD_WIDTH_MM, MIN_ROOM_BELOW_FIELD_MM, roundToTenth } from "../lib/field-geometry";
import { NumberField } from "./number-field";

type FieldPositionControlsProps = {
  field: TemplateField;
  page: TemplatePage;
  onChange: (changes: Partial<TemplateField>) => void;
};

// The same bounds as dragging on the canvas.
export function FieldPositionControls({ field, page, onChange }: FieldPositionControlsProps) {
  const step = FIELD_LIMITS.positionStep;

  return (
    <div className="grid grid-cols-3 gap-3">
      <NumberField
        label={INSPECTOR_COPY.left}
        value={field.xMm}
        min={0}
        max={roundToTenth(page.widthMm - field.widthMm)}
        step={step}
        onChange={(xMm) => onChange({ xMm: roundToTenth(xMm) })}
      />
      <NumberField
        label={INSPECTOR_COPY.top}
        value={field.yMm}
        min={0}
        max={roundToTenth(page.heightMm - MIN_ROOM_BELOW_FIELD_MM)}
        step={step}
        onChange={(yMm) => onChange({ yMm: roundToTenth(yMm) })}
      />
      <NumberField
        label={INSPECTOR_COPY.width}
        value={field.widthMm}
        min={MIN_FIELD_WIDTH_MM}
        max={roundToTenth(page.widthMm - field.xMm)}
        step={step}
        onChange={(widthMm) => onChange({ widthMm: roundToTenth(widthMm) })}
      />
    </div>
  );
}
