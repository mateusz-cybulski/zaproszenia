"use client";

import type { Event, EventGuest } from "@/entities/event";
import type { Template } from "@/entities/template";
import type { Page } from "@/shared/api";
import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogBody, DialogContent, DialogTitleBar } from "@/shared/ui/dialog";
import { DialogNameField } from "@/shared/ui/dialog-name-field";
import { FormStatus } from "@/shared/ui/form-status";

import { NAME_FIELD } from "../config/event-fields";
import { EVENT_DIALOG_COPY } from "../config/messages";
import type { EventSection } from "../model/event-section";
import { useEventForm } from "../model/use-event-form";
import { useEventSections } from "../model/use-event-sections";
import { EventForm } from "./event-form";
import { EventSectionSwitcher } from "./event-section-switcher";
import { EventSections } from "./event-sections";

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
  const copy = props.event ? EVENT_DIALOG_COPY.edit : EVENT_DIALOG_COPY.add;
  const eventForm = useEventForm(props.event, dismiss);
  const sections = useEventSections(props.event ? props.initialSection : "details");
  const nameMeta = eventForm.fields[NAME_FIELD.name];

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent
        className={props.event ? "max-w-4xl" : "max-w-2xl"}
        aria-describedby={undefined}
      >
        <DialogTitleBar
          start={
            props.event && (
              <EventSectionSwitcher section={sections.section} onChange={sections.changeSection} />
            )
          }
          end={
            <>
              <FormStatus result={eventForm.lastResult} />
              <Button type="submit" form={eventForm.form.id} disabled={eventForm.pending}>
                {eventForm.pending ? copy.pending : copy.submit}
              </Button>
            </>
          }
        >
          <DialogNameField
            key={nameMeta.key}
            label={NAME_FIELD.label}
            title={props.event?.name ?? copy.title}
            form={eventForm.form.id}
            id={nameMeta.id}
            name={nameMeta.name}
            defaultValue={nameMeta.defaultValue ?? ""}
            placeholder={NAME_FIELD.label}
            maxLength={NAME_FIELD.maxLength}
            error={nameMeta.errors?.[0]}
            errorId={nameMeta.errorId}
          />
        </DialogTitleBar>
        {props.event ? (
          <EventSections
            event={props.event}
            templates={props.templates}
            eventGuests={props.eventGuests}
            sections={sections}
            eventForm={eventForm}
          />
        ) : (
          <DialogBody>
            <EventForm eventForm={eventForm} />
          </DialogBody>
        )}
      </DialogContent>
    </Dialog>
  );
}
