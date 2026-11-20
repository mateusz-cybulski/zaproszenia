"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useId } from "react";

import {
  ALIGNMENT_LABELS,
  ALIGNMENTS,
  FONT_LABELS,
  FONT_NAMES,
  type Alignment,
  type TemplateField,
} from "@/entities/template";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { NativeSelect } from "@/shared/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { FIELD_LIMITS } from "../config/field-limits";
import { INSPECTOR_COPY } from "../config/inspector-copy";
import { NumberField } from "./number-field";

const ALIGNMENT_ICONS: Record<Alignment, typeof AlignLeft> = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

type FieldStyleControlsProps = {
  field: TemplateField;
  onChange: (changes: Partial<TemplateField>) => void;
};

export function FieldStyleControls({ field, onChange }: FieldStyleControlsProps) {
  const id = useId();

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2 grid gap-1.5">
        <Label htmlFor={`${id}-font`}>{INSPECTOR_COPY.font}</Label>
        <NativeSelect
          id={`${id}-font`}
          value={field.font}
          onChange={(event) => {
            const font = FONT_NAMES.find((name) => name === event.target.value);
            if (font) onChange({ font });
          }}
        >
          {FONT_NAMES.map((name) => (
            <option key={name} value={name}>
              {FONT_LABELS[name]}
            </option>
          ))}
        </NativeSelect>
      </div>
      <NumberField
        label={INSPECTOR_COPY.fontSize}
        value={field.fontSize}
        {...FIELD_LIMITS.fontSize}
        onChange={(fontSize) => onChange({ fontSize })}
      />
      <NumberField
        label={INSPECTOR_COPY.lineHeight}
        value={field.lineHeight}
        {...FIELD_LIMITS.lineHeight}
        onChange={(lineHeight) => onChange({ lineHeight })}
      />
      <div className="grid gap-1.5">
        <span id={`${id}-align`} className="text-sm font-medium">
          {INSPECTOR_COPY.alignment}
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-labelledby={`${id}-align`}
          value={field.align}
          onValueChange={(value) => {
            const align = ALIGNMENTS.find((alignment) => alignment === value);
            if (align) onChange({ align });
          }}
        >
          {ALIGNMENTS.map((alignment) => {
            const Icon = ALIGNMENT_ICONS[alignment];
            return (
              <ToggleGroupItem
                key={alignment}
                value={alignment}
                aria-label={ALIGNMENT_LABELS[alignment]}
              >
                <Icon />
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-color`}>{INSPECTOR_COPY.color}</Label>
        <Input
          id={`${id}-color`}
          type="color"
          className="w-16 p-1"
          value={field.color}
          onChange={(event) => onChange({ color: event.target.value })}
        />
      </div>
    </div>
  );
}
