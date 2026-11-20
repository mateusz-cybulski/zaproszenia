"use client";

import { useState, useTransition } from "react";

import type { TemplateId } from "@/entities/template";

import { saveTemplateAction } from "../api/save-template-action";
import type { TemplateDraft } from "./save-template";

// Marks as saved what was sent, so edits made while saving still count as unsaved.
export function useSaveTemplate(id: TemplateId, onSaved: (draft: TemplateDraft) => void) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);

  function save(draft: TemplateDraft) {
    setError(null);
    startTransition(async () => {
      const result = await saveTemplateAction(id, draft);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(draft);
      setSavedOnce(true);
    });
  }

  return { save, pending, error, savedOnce };
}
