"use client";

import { Save } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { SAVE_COPY } from "../config/save-copy";

type SaveTemplateButtonProps = {
  dirty: boolean;
  pending: boolean;
  savedOnce: boolean;
  emptyFieldCount: number;
  nameEmpty: boolean;
  onSave: () => void;
};

export function SaveTemplateButton({
  dirty,
  pending,
  savedOnce,
  emptyFieldCount,
  nameEmpty,
  onSave,
}: SaveTemplateButtonProps) {
  // An empty name is reported under the name field.
  const blocked = emptyFieldCount > 0 || nameEmpty;
  const status =
    emptyFieldCount > 0
      ? SAVE_COPY.emptyFields(emptyFieldCount)
      : !dirty && savedOnce && !pending
        ? SAVE_COPY.saved
        : "";

  return (
    <div className="flex items-center gap-3">
      <p
        role="status"
        className={
          emptyFieldCount > 0
            ? "max-w-xs text-xs text-destructive"
            : "text-xs text-muted-foreground"
        }
      >
        {status}
      </p>
      <Button size="sm" onClick={onSave} disabled={!dirty || blocked || pending}>
        <Save /> {pending ? SAVE_COPY.saving : SAVE_COPY.save}
      </Button>
    </div>
  );
}
