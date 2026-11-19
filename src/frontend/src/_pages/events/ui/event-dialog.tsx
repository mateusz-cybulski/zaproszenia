"use client";

import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { eventDialogCopy } from "../config/messages";
import { EventForm } from "./event-form";

export function EventDialog({ dismissal }: { dismissal: Dismissal }) {
  const dismiss = useDismiss(dismissal, routes.events());

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pr-8">
          <DialogTitle>{eventDialogCopy.title}</DialogTitle>
          <DialogDescription>{eventDialogCopy.description}</DialogDescription>
        </DialogHeader>
        <EventForm onSaved={dismiss} />
      </DialogContent>
    </Dialog>
  );
}
