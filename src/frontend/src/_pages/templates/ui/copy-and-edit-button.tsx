"use client";

import { Copy } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { SAVE_COPY } from "../config/save-copy";

type CopyAndEditButtonProps = { pending: boolean; onCopy: () => void };

export function CopyAndEditButton({ pending, onCopy }: CopyAndEditButtonProps) {
  return (
    <Button size="sm" onClick={onCopy} disabled={pending}>
      <Copy /> {pending ? SAVE_COPY.copying : SAVE_COPY.copyAndEdit}
    </Button>
  );
}
