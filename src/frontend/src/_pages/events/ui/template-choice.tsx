"use client";

import type { FieldMetadata } from "@conform-to/react";
import { useState } from "react";

import type { Template, TemplateKind } from "@/entities/template";
import { Label } from "@/shared/ui/label";
import { NativeSelect } from "@/shared/ui/native-select";

import { templateOptions } from "../model/template-options";
import { TemplatePreview } from "./template-preview";

type TemplateChoiceProps = {
  eventId: number;
  kind: TemplateKind;
  label: string;
  templates: Template[];
  meta: FieldMetadata<string | undefined>;
};

// The preview follows the select before saving, so a template can be tried on this event.
export function TemplateChoice({ eventId, kind, label, templates, meta }: TemplateChoiceProps) {
  const [selectedId, setSelectedId] = useState(meta.initialValue ?? "");
  const selected = templates.find((template) => String(template.id) === selectedId);
  const error = meta.errors?.[0];

  return (
    <div className="grid content-start gap-3">
      <div className="grid gap-2">
        <Label htmlFor={meta.id}>{label}</Label>
        <NativeSelect
          key={meta.key}
          id={meta.id}
          name={meta.name}
          defaultValue={meta.initialValue ?? ""}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? meta.errorId : undefined}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {templateOptions(templates, kind).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
        {error && (
          <p id={meta.errorId} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
      <TemplatePreview eventId={eventId} template={selected} />
    </div>
  );
}
