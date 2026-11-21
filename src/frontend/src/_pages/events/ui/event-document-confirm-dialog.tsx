"use client";

import type { EventDocumentProblem } from "@/entities/event";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { EVENT_DOCUMENTS_COPY } from "../config/messages";

type EventDocumentConfirmDialogProps = {
  problem: EventDocumentProblem | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function EventDocumentConfirmDialog({
  problem,
  onConfirm,
  onCancel,
}: EventDocumentConfirmDialogProps) {
  return (
    <Dialog open={problem !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{EVENT_DOCUMENTS_COPY.confirmTitle}</DialogTitle>
          <DialogDescription>{EVENT_DOCUMENTS_COPY.confirmDescription}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <ul className="grid list-disc gap-2 pl-5 text-sm">
            {problem && problem.unverified > 0 && (
              <li>{EVENT_DOCUMENTS_COPY.unverified(problem.unverified)}</li>
            )}
            {problem?.senderIncomplete && <li>{EVENT_DOCUMENTS_COPY.senderIncomplete}</li>}
          </ul>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} autoFocus>
              {EVENT_DOCUMENTS_COPY.cancel}
            </Button>
            <Button onClick={onConfirm}>{EVENT_DOCUMENTS_COPY.confirm}</Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
