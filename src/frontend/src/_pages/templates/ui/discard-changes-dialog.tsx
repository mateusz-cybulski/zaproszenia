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

import { SAVE_COPY } from "../config/save-copy";

type DiscardChangesDialogProps = {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
};

export function DiscardChangesDialog({
  open,
  onKeepEditing,
  onDiscard,
}: DiscardChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onKeepEditing()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{SAVE_COPY.discardTitle}</DialogTitle>
          <DialogDescription>{SAVE_COPY.discardDescription}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onKeepEditing} autoFocus>
              {SAVE_COPY.keepEditing}
            </Button>
            <Button variant="destructive" onClick={onDiscard}>
              {SAVE_COPY.discard}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
