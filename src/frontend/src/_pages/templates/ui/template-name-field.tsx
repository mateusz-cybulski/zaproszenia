"use client";

import { Input } from "@/shared/ui/input";

import { SAVE_COPY } from "../config/save-copy";
import { MAX_NAME_LENGTH } from "../config/upload";

type TemplateNameFieldProps = { name: string; onChange: (name: string) => void };

// The dialog's title, edited in place; an empty name is reported next to the save button.
export function TemplateNameField({ name, onChange }: TemplateNameFieldProps) {
  return (
    <Input
      aria-label={SAVE_COPY.name}
      value={name}
      maxLength={MAX_NAME_LENGTH}
      aria-invalid={name.trim() === ""}
      className="h-9 w-96 text-center text-base font-medium md:text-base"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
