"use client";

import type { Event, EventGuest } from "@/entities/event";
import type { Template } from "@/entities/template";
import type { Page } from "@/shared/api";
import { type Dismissal, useDismiss, useReturnFocus } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";

import type { EventSection } from "../model/event-section";
import { ExistingEventDialogContent } from "./existing-event-dialog-content";
import { NewEventDialogContent } from "./new-event-dialog-content";

type EventDialogProps = {
  dismissal: Dismissal;
} & (
  | { event?: undefined }
  | {
      event: Event;
      templates: Template[];
      eventGuests: Page<EventGuest>;
      initialSection: EventSection;
    }
);

export function EventDialog(props: EventDialogProps) {
  const dismiss = useDismiss(props.dismissal, routes.events());
  const returnFocus = useReturnFocus();

  return props.event ? (
    <ExistingEventDialogContent
      event={props.event}
      templates={props.templates}
      eventGuests={props.eventGuests}
      initialSection={props.initialSection}
      dismiss={dismiss}
      returnFocus={returnFocus}
    />
  ) : (
    <NewEventDialogContent dismiss={dismiss} returnFocus={returnFocus} />
  );
}
