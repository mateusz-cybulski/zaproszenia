"use client";

import { TriangleAlert } from "lucide-react";

import type { EditorOptions, TemplateDetail } from "@/entities/template";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

import { EDITOR_COPY } from "../config/field-presets";
import { useLivePreview } from "../model/use-live-preview";
import type { TemplateEditorState } from "../model/use-template-editor";
import { FieldCanvas } from "./field-canvas";
import { FieldInspector } from "./field-inspector";
import { FieldList } from "./field-list";

type TemplateEditorProps = {
  template: TemplateDetail;
  options: EditorOptions;
  editor: TemplateEditorState;
};

export function TemplateEditor({ template, options, editor }: TemplateEditorProps) {
  const readOnly = template.isSystem;
  // An emptied field is flagged in the inspector; the API would reject the whole preview for it.
  const previewFields = editor.fields.filter((field) => field.content.trim() !== "");
  const preview = useLivePreview(template.id, previewFields, editor.pageIndex);
  const page = template.pages[editor.pageIndex];
  if (!page) {
    return null;
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_22rem] gap-6">
      <div className="sticky top-0 grid content-start gap-3 self-start">
        {preview.error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>{EDITOR_COPY.previewFailed}</AlertTitle>
            <AlertDescription>{preview.error}</AlertDescription>
          </Alert>
        )}
        <FieldCanvas
          page={page}
          pageIndex={editor.pageIndex}
          fields={editor.pageFields}
          placeholders={options.placeholders}
          selectedId={editor.selectedId}
          readOnly={readOnly}
          imageUrl={preview.imageUrl}
          loading={preview.loading}
          onSelect={editor.select}
          onChange={editor.changeField}
        />
        <p className="text-xs text-muted-foreground">{EDITOR_COPY.canvasHint}</p>
      </div>

      <section aria-labelledby="template-fields" className="grid content-start gap-3">
        <h3 id="template-fields" className="font-medium">
          {EDITOR_COPY.fields}
        </h3>
        {editor.selected ? (
          <FieldInspector
            key={editor.selected.id}
            field={editor.selected}
            page={page}
            options={options}
            readOnly={readOnly}
            onChange={(changes) =>
              editor.selected && editor.changeField(editor.selected.id, changes)
            }
            onRemove={() => editor.selected && editor.removeField(editor.selected.id)}
            onClose={() => editor.select(null)}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{EDITOR_COPY.pickField}</p>
            <FieldList
              fields={editor.pageFields}
              readOnly={readOnly}
              onSelect={editor.select}
              onAdd={editor.addField}
            />
          </>
        )}
      </section>
    </div>
  );
}
