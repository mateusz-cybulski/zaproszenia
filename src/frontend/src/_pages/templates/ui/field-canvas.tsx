"use client";

import { LoaderCircle } from "lucide-react";
import { type PointerEvent, useRef } from "react";

import type { Placeholder, TemplateField, TemplatePage } from "@/entities/template";
import { cn } from "@/shared/lib/css";

import { EDITOR_COPY } from "../config/field-presets";
import { clamp, estimatedHeightMm, MIN_FIELD_WIDTH_MM, roundToTenth } from "../lib/field-geometry";

type Drag = {
  id: string;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  field: TemplateField;
};

type FieldCanvasProps = {
  page: TemplatePage;
  fields: TemplateField[];
  placeholders: Placeholder[];
  selectedId: string | null;
  readOnly: boolean;
  imageUrl: string | null;
  loading: boolean;
  onSelect: (id: string | null) => void;
  onChange: (id: string, changes: Partial<TemplateField>) => void;
};

// The page preview with a frame per field: drag a frame to move it, its handle to resize it.
// The inspector's position inputs are the keyboard alternative to dragging.
export function FieldCanvas({
  page,
  fields,
  placeholders,
  selectedId,
  readOnly,
  imageUrl,
  loading,
  onSelect,
  onChange,
}: FieldCanvasProps) {
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);

  function mmPerPixel(): number {
    const width = canvas.current?.getBoundingClientRect().width ?? page.widthMm;
    return page.widthMm / width;
  }

  function startDrag(event: PointerEvent, field: TemplateField, mode: Drag["mode"]) {
    onSelect(field.id);
    event.stopPropagation();
    if (readOnly) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: field.id, mode, startX: event.clientX, startY: event.clientY, field };
  }

  function moveDrag(event: PointerEvent) {
    const current = drag.current;
    if (!current) {
      return;
    }
    const scale = mmPerPixel();
    const deltaX = (event.clientX - current.startX) * scale;
    const deltaY = (event.clientY - current.startY) * scale;
    const { field } = current;
    if (current.mode === "move") {
      onChange(current.id, {
        xMm: roundToTenth(clamp(field.xMm + deltaX, 0, page.widthMm - field.widthMm)),
        yMm: roundToTenth(clamp(field.yMm + deltaY, 0, page.heightMm - 2)),
      });
    } else {
      onChange(current.id, {
        widthMm: roundToTenth(
          clamp(field.widthMm + deltaX, MIN_FIELD_WIDTH_MM, page.widthMm - field.xMm),
        ),
      });
    }
  }

  return (
    <div
      ref={canvas}
      className="relative mx-auto w-full touch-none overflow-hidden rounded-md border bg-white shadow-sm select-none"
      style={{
        aspectRatio: `${page.widthMm} / ${page.heightMm}`,
        maxWidth: `calc(70dvh * ${page.widthMm / page.heightMm})`,
      }}
      onPointerMove={moveDrag}
      onPointerUp={() => (drag.current = null)}
      onPointerDown={() => onSelect(null)}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="absolute inset-0 size-full" draggable={false} />
      )}
      {loading && (
        <LoaderCircle
          className="absolute top-2 right-2 size-4 animate-spin text-muted-foreground"
          aria-hidden
        />
      )}
      {fields.map((field) => {
        const selected = field.id === selectedId;
        return (
          <div
            key={field.id}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={EDITOR_COPY.fieldLabel(field.content.replace(/\n/g, " "))}
            onPointerDown={(event) => startDrag(event, field, "move")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(field.id);
              }
            }}
            className={cn(
              "absolute rounded-sm border outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              readOnly ? "cursor-pointer" : "cursor-move",
              selected
                ? "border-2 border-primary bg-primary/10"
                : "border-dashed border-primary/60 hover:bg-primary/5",
            )}
            style={{
              left: `${(field.xMm / page.widthMm) * 100}%`,
              top: `${(field.yMm / page.heightMm) * 100}%`,
              width: `${(field.widthMm / page.widthMm) * 100}%`,
              height: `${(estimatedHeightMm(field, placeholders) / page.heightMm) * 100}%`,
            }}
          >
            {selected && !readOnly && (
              <div
                aria-label={EDITOR_COPY.resize}
                onPointerDown={(event) => startDrag(event, field, "resize")}
                className="absolute top-1/2 -right-1.5 h-5 w-2.5 -translate-y-1/2 cursor-ew-resize rounded-sm bg-primary"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
