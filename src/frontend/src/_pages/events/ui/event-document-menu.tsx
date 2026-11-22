"use client";

import { ChevronDown, FileText, type LucideIcon, Mail, Printer } from "lucide-react";
import { useState } from "react";

import type { EventDocumentKind } from "@/entities/event";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

import { EVENT_DOCUMENTS_COPY } from "../config/messages";

const ITEMS: readonly { kind: EventDocumentKind; icon: LucideIcon }[] = [
  { kind: "invitation", icon: FileText },
  { kind: "envelope", icon: Mail },
];

type EventDocumentMenuProps = {
  pending: EventDocumentKind | null;
  busy: boolean;
  onGenerate: (kind: EventDocumentKind) => void;
};

// Below lg (a narrow window, 200% zoom) the trigger shows only its icon; the label stays for
// screen readers and in the tooltip. Radix opens the menu on pointer down, so a busy menu is
// kept closed here rather than by aria-disabled, which only stops clicks.
export function EventDocumentMenu({ pending, busy, onGenerate }: EventDocumentMenuProps) {
  const [open, setOpen] = useState(false);
  const blocked = busy || pending !== null;

  return (
    <TooltipProvider delayDuration={300}>
      <DropdownMenu open={open} onOpenChange={(nextOpen) => setOpen(nextOpen && !blocked)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-disabled={blocked}>
                <Printer />
                <span className="max-lg:sr-only">
                  {pending ? EVENT_DOCUMENTS_COPY.generating : EVENT_DOCUMENTS_COPY.label}
                </span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{EVENT_DOCUMENTS_COPY.menuTooltip}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          {ITEMS.map(({ kind, icon: Icon }) => (
            <DropdownMenuItem key={kind} onSelect={() => onGenerate(kind)}>
              <Icon /> {EVENT_DOCUMENTS_COPY[kind]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
