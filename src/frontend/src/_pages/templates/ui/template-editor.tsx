"use client";

import { TriangleAlert, Trash } from "lucide-react";

import { type EditorOptions, pageSizeLabel, type TemplateDetail } from "@/entities/template";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { NativeSelect } from "@/shared/ui/native-select";

import { EDITOR_COPY } from "../config/field-presets";
import { useLivePreview } from "../model/use-live-preview";
import { useTemplateEditor } from "../model/use-template-editor";
import { FieldCanvas } from "./field-canvas";
import { FieldList } from "./field-list";

type TemplateEditorProps = { template: TemplateDetail; options: EditorOptions };

export function TemplateEditor({ template, options }: TemplateEditorProps) {
  const readOnly = template.isSystem;
  const editor = useTemplateEditor(template, options);
  const preview = useLivePreview(template.id, editor.fields, editor.pageIndex);
  const page = template.pages[editor.pageIndex];
  if (!page) {
    return null;
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_22rem] gap-6">
      <div className="grid content-start gap-3">
        <div className="flex items-center gap-3">
          {template.pages.length > 1 && (
            <div className="flex items-center gap-2">
              <Label htmlFor="template-page" className="sr-only">
                {EDITOR_COPY.pageSelect}
              </Label>
              <NativeSelect
                id="template-page"
                value={editor.pageIndex}
                onChange={(event) => editor.showPage(Number(event.target.value))}
              >
                {template.pages.map((_page, index) => (
                  <option key={index} value={index}>
                    {EDITOR_COPY.page(index)}
                  </option>
                ))}
              </NativeSelect>
            </div>
          )}
          <span className="text-sm text-muted-foreground">{pageSizeLabel(page)}</span>
        </div>
        {preview.error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>{EDITOR_COPY.previewFailed}</AlertTitle>
            <AlertDescription>{preview.error}</AlertDescription>
          </Alert>
        )}
        <FieldCanvas
          page={page}
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
          <div className="grid gap-3">
            <p className="rounded-md border p-2 font-mono text-xs whitespace-pre-wrap">
              {editor.selected.content}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => editor.select(null)}>
                Wszystkie pola
              </Button>
              {!readOnly && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => editor.selected && editor.removeField(editor.selected.id)}
                >
                  <Trash /> Usuń pole
                </Button>
              )}
            </div>
          </div>
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
