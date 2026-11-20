"use client";

import type { Event, EventGuest } from "@/entities/event";
import type { Template } from "@/entities/template";
import type { Page } from "@/shared/api";
import { DialogBody } from "@/shared/ui/dialog";

import type { EventFormState } from "../model/use-event-form";
import type { EventSectionsState } from "../model/use-event-sections";
import { EventForm } from "./event-form";
import { EventGuestsSection } from "./event-guests-section";
import { TemplateChoiceForm } from "./template-choice-form";

type EventSectionsProps = {
  event: Event;
  templates: Template[];
  eventGuests: Page<EventGuest>;
  sections: EventSectionsState;
  eventForm: EventFormState;
};

export function EventSections({
  event,
  templates,
  eventGuests,
  sections,
  eventForm,
}: EventSectionsProps) {
  const { section, opened, bodyRef } = sections;

  return (
    <DialogBody ref={bodyRef}>
      <div hidden={section !== "details"}>
        <EventForm eventForm={eventForm} />
      </div>
      {opened.has("templates") && (
        <div hidden={section !== "templates"}>
          <TemplateChoiceForm event={event} templates={templates} />
        </div>
      )}
      {opened.has("guests") && (
        <div hidden={section !== "guests"}>
          <EventGuestsSection event={event} eventGuests={eventGuests} />
        </div>
      )}
    </DialogBody>
  );
}
