"use client";

import { useId } from "react";

import { CASES, DATE_FORMATS, type EditorOptions, type TemplateField } from "@/entities/template";
import { Label } from "@/shared/ui/label";
import { NativeSelect } from "@/shared/ui/native-select";

import { INSPECTOR_COPY } from "../config/inspector-copy";
import { grammarPlaceholders } from "../lib/grammar-placeholders";

const NOMINATIVE = "nom";

type FieldGrammarControlsProps = {
  field: TemplateField;
  options: EditorOptions;
  onChange: (changes: Partial<TemplateField>) => void;
};

export function FieldGrammarControls({ field, options, onChange }: FieldGrammarControlsProps) {
  const id = useId();
  const { usesDate, declinable } = grammarPlaceholders(field.content, options.placeholders);

  return (
    <div className="grid gap-3">
      {usesDate && (
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-date`}>{INSPECTOR_COPY.dateFormat}</Label>
          <NativeSelect
            id={`${id}-date`}
            value={field.dateFormat}
            onChange={(event) => {
              const dateFormat = DATE_FORMATS.find((format) => format === event.target.value);
              if (dateFormat) onChange({ dateFormat });
            }}
          >
            {options.dateFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.example}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
      {declinable.map(({ name, label }) => (
        <div key={name} className="grid gap-1.5">
          <Label htmlFor={`${id}-${name}`}>{INSPECTOR_COPY.caseOf(label)}</Label>
          <NativeSelect
            id={`${id}-${name}`}
            value={field.cases[name] ?? NOMINATIVE}
            onChange={(event) => {
              const grammaticalCase = CASES.find((value) => value === event.target.value);
              if (!grammaticalCase) return;
              const cases = { ...field.cases };
              // The API stores no entry for the nominative.
              if (grammaticalCase === NOMINATIVE) {
                delete cases[name];
              } else {
                cases[name] = grammaticalCase;
              }
              onChange({ cases });
            }}
          >
            {options.cases.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.examples[name] ? `: ${option.examples[name]}` : ""}
              </option>
            ))}
          </NativeSelect>
        </div>
      ))}
    </div>
  );
}
