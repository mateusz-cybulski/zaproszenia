"use client";

import { FileText, type LucideIcon, Mail } from "lucide-react";

import type { EventDocumentKind } from "@/entities/event";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

import { EVENT_DOCUMENTS_COPY } from "../config/messages";

const KINDS: readonly { kind: EventDocumentKind; icon: LucideIcon }[] = [
  { kind: "invitation", icon: FileText },
  { kind: "envelope", icon: Mail },
];

type EventDocumentButtonsProps = {
  pending: EventDocumentKind | null;
  busy: boolean;
  onGenerate: (kind: EventDocumentKind) => void;
};

// Below lg (a narrow window, 200% zoom) only the icons show; the name stays for screen readers
// and in the tooltip.
export function EventDocumentButtons({ pending, busy, onGenerate }: EventDocumentButtonsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div role="group" aria-label={EVENT_DOCUMENTS_COPY.label} className="flex gap-2">
        {KINDS.map(({ kind, icon: Icon }) => (
          <Tooltip key={kind}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                aria-disabled={busy || pending !== null}
                onClick={() => onGenerate(kind)}
              >
                <Icon />
                <span className="max-lg:sr-only">
                  {pending === kind ? EVENT_DOCUMENTS_COPY.generating : EVENT_DOCUMENTS_COPY[kind]}
                </span>
                <span className="sr-only"> (PDF)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{EVENT_DOCUMENTS_COPY.tooltip(kind)}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
