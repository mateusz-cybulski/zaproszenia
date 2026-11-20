"use client";

import { ArrowLeft, Trash } from "lucide-react";
import type { ReactNode } from "react";

import type { EditorOptions, TemplateField, TemplatePage } from "@/entities/template";
import { Button } from "@/shared/ui/button";
import { TooltipProvider } from "@/shared/ui/tooltip";

import { INSPECTOR_COPY } from "../config/inspector-copy";
import { grammarPlaceholders } from "../lib/grammar-placeholders";
import { FieldContentEditor } from "./field-content-editor";
import { FieldGrammarControls } from "./field-grammar-controls";
import { FieldPositionControls } from "./field-position-controls";
import { FieldStyleControls } from "./field-style-controls";

type FieldInspectorProps = {
  field: TemplateField;
  page: TemplatePage;
  options: EditorOptions;
  readOnly: boolean;
  onChange: (changes: Partial<TemplateField>) => void;
  onRemove: () => void;
  onClose: () => void;
};

function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-t pt-3">
      <h4 className="text-sm font-medium">{title}</h4>
      {children}
    </section>
  );
}

export function FieldInspector({
  field,
  page,
  options,
  readOnly,
  onChange,
  onRemove,
  onClose,
}: FieldInspectorProps) {
  const grammar = grammarPlaceholders(field.content, options.placeholders);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid gap-3">
        <div className="flex justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft /> {INSPECTOR_COPY.back}
          </Button>
          {!readOnly && (
            <Button variant="destructive" size="sm" onClick={onRemove}>
              <Trash /> {INSPECTOR_COPY.remove}
            </Button>
          )}
        </div>
        <fieldset disabled={readOnly} className="grid min-w-0 gap-3">
          <InspectorSection title={INSPECTOR_COPY.content}>
            <FieldContentEditor
              content={field.content}
              placeholders={options.placeholders}
              onChange={(content) => onChange({ content })}
            />
          </InspectorSection>
          {(grammar.usesDate || grammar.declinable.length > 0) && (
            <InspectorSection title={INSPECTOR_COPY.grammar}>
              <FieldGrammarControls field={field} options={options} onChange={onChange} />
            </InspectorSection>
          )}
          <InspectorSection title={INSPECTOR_COPY.look}>
            <FieldStyleControls field={field} onChange={onChange} />
          </InspectorSection>
          <InspectorSection title={INSPECTOR_COPY.position}>
            <p className="text-xs text-muted-foreground">{INSPECTOR_COPY.positionHint}</p>
            <FieldPositionControls field={field} page={page} onChange={onChange} />
          </InspectorSection>
        </fieldset>
      </div>
    </TooltipProvider>
  );
}
