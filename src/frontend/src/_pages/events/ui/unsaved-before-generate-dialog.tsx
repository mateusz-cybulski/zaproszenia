"use client";

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

type UnsavedBeforeGenerateDialogProps = {
  open: boolean;
  onSaveAndGenerate: () => void;
  onGenerate: () => void;
  onCancel: () => void;
};

export function UnsavedBeforeGenerateDialog({
  open,
  onSaveAndGenerate,
  onGenerate,
  onCancel,
}: UnsavedBeforeGenerateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{EVENT_DOCUMENTS_COPY.unsavedTitle}</DialogTitle>
          <DialogDescription>{EVENT_DOCUMENTS_COPY.unsavedDescription}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>
              {EVENT_DOCUMENTS_COPY.cancel}
            </Button>
            <Button variant="outline" onClick={onGenerate}>
              {EVENT_DOCUMENTS_COPY.generateWithoutSaving}
            </Button>
            <Button onClick={onSaveAndGenerate}>{EVENT_DOCUMENTS_COPY.saveAndGenerate}</Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
