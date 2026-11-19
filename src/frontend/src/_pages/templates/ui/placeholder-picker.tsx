"use client";

import { PLACEHOLDER_GROUPS, type Placeholder } from "@/entities/template";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

import { INSPECTOR_COPY } from "../config/inspector-copy";

type PlaceholderPickerProps = {
  placeholders: Placeholder[];
  onInsert: (placeholder: Placeholder) => void;
};

export function PlaceholderPicker({ placeholders, onInsert }: PlaceholderPickerProps) {
  return (
    <div className="grid gap-2">
      {PLACEHOLDER_GROUPS.map((group) => (
        <div key={group} role="group" aria-label={group} className="grid gap-1">
          <span className="text-xs text-muted-foreground">{group}</span>
          <div className="flex flex-wrap gap-1">
            {placeholders
              .filter((placeholder) => placeholder.group === group)
              .map((placeholder) => (
                <Tooltip key={placeholder.name}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onInsert(placeholder)}
                    >
                      {placeholder.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="grid gap-0.5">
                    <span>{placeholder.description}</span>
                    <span className="opacity-80">
                      {INSPECTOR_COPY.example(placeholder.example)}
                    </span>
                  </TooltipContent>
                </Tooltip>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
