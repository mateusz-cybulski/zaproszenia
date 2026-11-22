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

type DiscardChangesDialogProps = {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
};

// Asked when a form with unsaved changes is about to close; staying is the default.
export function DiscardChangesDialog({
  open,
  onKeepEditing,
  onDiscard,
}: DiscardChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onKeepEditing()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Masz niezapisane zmiany</DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz wyjść? Niezapisane zmiany przepadną.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onKeepEditing}>
              Wróć do edycji
            </Button>
            <Button variant="destructive" onClick={onDiscard}>
              Wyjdź bez zapisywania
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
