"use client";

import { useId, useRef } from "react";

import type { Placeholder } from "@/entities/template";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

import { FIELD_LIMITS } from "../config/field-limits";
import { INSPECTOR_COPY } from "../config/inspector-copy";
import { PlaceholderPicker } from "./placeholder-picker";

type FieldContentEditorProps = {
  content: string;
  placeholders: Placeholder[];
  onChange: (content: string) => void;
};

export function FieldContentEditor({ content, placeholders, onChange }: FieldContentEditorProps) {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const empty = content.trim() === "";

  function insert(placeholder: Placeholder) {
    const token = `{${placeholder.label}}`;
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? start;
    const next = content.slice(0, start) + token + content.slice(end);
    if (next.length > FIELD_LIMITS.contentLength) {
      return;
    }
    onChange(next);
    // After React has put the new value in the textarea, or the caret would jump to the end.
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + token.length, start + token.length);
    });
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor={id}>{INSPECTOR_COPY.contentLabel}</Label>
        <Textarea
          id={id}
          ref={textareaRef}
          rows={4}
          maxLength={FIELD_LIMITS.contentLength}
          value={content}
          aria-invalid={empty}
          aria-describedby={empty ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        {empty && (
          <p id={`${id}-error`} className="text-xs text-destructive">
            {INSPECTOR_COPY.contentEmpty}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <span className="text-sm font-medium">{INSPECTOR_COPY.insertData}</span>
        <p className="text-xs text-muted-foreground">{INSPECTOR_COPY.insertHint}</p>
        <PlaceholderPicker placeholders={placeholders} onInsert={insert} />
      </div>
    </div>
  );
}
