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

// The fields being edited, shown with placeholder labels, and which page and field are in view.
export function useTemplateEditor(template: TemplateDetail, options: EditorOptions) {
  const [fields, setFields] = useState<TemplateField[]>(() =>
    template.fields.map((field) => ({
      ...field,
      content: toDisplay(field.content, options.placeholders),
    })),
  );
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
    fields,
    pageFields: fields.filter((field) => field.page === pageIndex),
    selected: fields.find((field) => field.id === selectedId) ?? null,
    selectedId,
    pageIndex,
    select: setSelectedId,
    changeField,
    addField,
    removeField,
    showPage,
  };
}
