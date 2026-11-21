"use client";

import { Download } from "lucide-react";

import type { Event, EventDocumentKind } from "@/entities/event";
import { Button } from "@/shared/ui/button";

import { EVENT_DOCUMENTS_COPY } from "../config/messages";
import { useEventDocument } from "../model/use-event-document";
import { EventDocumentConfirmDialog } from "./event-document-confirm-dialog";

const KINDS: readonly EventDocumentKind[] = ["invitation", "envelope"];

export function EventDocuments({ event }: { event: Event }) {
  const documents = useEventDocument(event);

  return (
    <div className="grid justify-items-end gap-1">
      <div role="group" aria-label={EVENT_DOCUMENTS_COPY.label} className="flex gap-2">
        {KINDS.map((kind) => (
          <Button
            key={kind}
            variant="outline"
            size="sm"
            aria-disabled={documents.pending !== null}
            onClick={() => void documents.generate(kind)}
          >
            <Download />
            {documents.pending === kind
              ? EVENT_DOCUMENTS_COPY.generating
              : EVENT_DOCUMENTS_COPY[kind]}
          </Button>
        ))}
      </div>
      <p role="alert" className="text-sm text-destructive empty:hidden">
        {documents.error}
      </p>
      <EventDocumentConfirmDialog
        problem={documents.confirmation?.problem ?? null}
        onCancel={documents.cancel}
        onConfirm={() =>
          documents.confirmation && void documents.generate(documents.confirmation.kind, true)
        }
      />
    </div>
  );
}
