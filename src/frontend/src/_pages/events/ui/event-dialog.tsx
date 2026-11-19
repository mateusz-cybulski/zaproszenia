"use client";

import type { Event } from "@/entities/event";
import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { EVENT_DIALOG_COPY } from "../config/messages";
import { EventForm } from "./event-form";

type EventDialogProps = { event?: Event; dismissal: Dismissal };

export function EventDialog({ event, dismissal }: EventDialogProps) {
  const dismiss = useDismiss(dismissal, routes.events());
  const copy = event ? EVENT_DIALOG_COPY.edit : EVENT_DIALOG_COPY.add;

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pr-8">
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <EventForm event={event} onSaved={dismiss} />
      </DialogContent>
    </Dialog>
  );
}
