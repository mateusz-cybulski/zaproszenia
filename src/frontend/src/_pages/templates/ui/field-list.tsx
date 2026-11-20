"use client";

import { Plus } from "lucide-react";

import type { TemplateField } from "@/entities/template";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { EDITOR_COPY, FIELD_PRESETS, type FieldPreset } from "../config/field-presets";
import { SAVE_COPY } from "../config/save-copy";

type FieldListProps = {
  fields: TemplateField[];
  readOnly: boolean;
  onSelect: (id: string) => void;
  onAdd: (preset: FieldPreset) => void;
};

export function FieldList({ fields, readOnly, onSelect, onAdd }: FieldListProps) {
  return (
    <div className="grid gap-3">
      {!readOnly && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-self-start">
              <Plus /> {EDITOR_COPY.addField}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {FIELD_PRESETS.map((preset) => (
              <DropdownMenuItem key={preset.label} onSelect={() => onAdd(preset)}>
                {preset.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">{EDITOR_COPY.noFields}</p>
      ) : (
        <ul className="grid gap-1">
          {fields.map((field) => (
            <li key={field.id}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start truncate"
                onClick={() => onSelect(field.id)}
              >
                {field.content.trim() === "" ? (
                  <span className="text-destructive">{SAVE_COPY.emptyField}</span>
                ) : (
                  field.content.replace(/\n/g, " ⏎ ")
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
