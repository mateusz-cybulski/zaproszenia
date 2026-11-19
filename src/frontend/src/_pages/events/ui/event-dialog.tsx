"use client";

import type { Event } from "@/entities/event";
import type { Template } from "@/entities/template";
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
import type { EventSection } from "../model/event-section";
import { EventForm } from "./event-form";
import { EventSections } from "./event-sections";

type EventDialogProps = {
  dismissal: Dismissal;
} & ({ event?: undefined } | { event: Event; templates: Template[]; initialSection: EventSection });

export function EventDialog(props: EventDialogProps) {
  const dismiss = useDismiss(props.dismissal, routes.events());
  const copy = props.event ? EVENT_DIALOG_COPY.edit : EVENT_DIALOG_COPY.add;

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className={props.event ? "max-w-3xl" : "max-w-2xl"}>
        <DialogHeader className="pr-8">
          <DialogTitle>{props.event ? props.event.name : copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        {props.event ? (
          <EventSections
            event={props.event}
            templates={props.templates}
            initialSection={props.initialSection}
            onSaved={dismiss}
          />
        ) : (
          <EventForm onSaved={dismiss} />
        )}
      </DialogContent>
    </Dialog>
  );
}
