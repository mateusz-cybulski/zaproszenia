"use client";

import { useState } from "react";

import {
  type EditorOptions,
  type TemplateDetail,
  type TemplateField,
  toDisplay,
} from "@/entities/template";

import type { FieldPreset } from "../config/field-presets";
import { newField } from "./new-field";
import type { TemplateDraft } from "./save-template";

function snapshot(draft: TemplateDraft): string {
  return JSON.stringify(draft);
}

// The name and fields being edited, shown with placeholder labels, and which page and field are in view.
export function useTemplateEditor(template: TemplateDetail, options: EditorOptions) {
  const [name, setName] = useState(template.name);
  const [fields, setFields] = useState<TemplateField[]>(() =>
    template.fields.map((field) => ({
      ...field,
      content: toDisplay(field.content, options.placeholders),
    })),
  );
  const [saved, setSaved] = useState(() => snapshot({ name, fields }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  function changeField(id: string, changes: Partial<TemplateField>) {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, ...changes } : field)),
    );
  }

  function addField(preset: FieldPreset) {
    const page = template.pages[pageIndex];
    if (!page) {
      return;
    }
    const field = newField(preset, page, pageIndex, options.placeholders);
    setFields((current) => [...current, field]);
    setSelectedId(field.id);
  }

  function removeField(id: string) {
    setFields((current) => current.filter((field) => field.id !== id));
    setSelectedId(null);
  }

  function showPage(index: number) {
    setPageIndex(index);
    setSelectedId(null);
  }

  return {
    name,
    fields,
    draft: { name, fields },
    dirty: snapshot({ name, fields }) !== saved,
    emptyFieldCount: fields.filter((field) => field.content.trim() === "").length,
    pageFields: fields.filter((field) => field.page === pageIndex),
    selected: fields.find((field) => field.id === selectedId) ?? null,
    selectedId,
    pageIndex,
    rename: setName,
    markSaved: (draft: TemplateDraft) => setSaved(snapshot(draft)),
    select: setSelectedId,
    changeField,
    addField,
    removeField,
    showPage,
  };
}

export type TemplateEditorState = ReturnType<typeof useTemplateEditor>;
