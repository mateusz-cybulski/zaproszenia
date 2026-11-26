"use client";

import type { Event, EventGuest, EventReadiness } from "@/entities/event";
import type { Template } from "@/entities/template";
import type { Page } from "@/shared/api";
import { DialogBody } from "@/shared/ui/dialog";

import type { EventFormState } from "../model/use-event-form";
import type { EventSectionsState } from "../model/use-event-sections";
import { EventDetailsFields } from "./event-details-fields";
import { EventGuestsSection } from "./event-guests-section";
import { EventReadinessNotice } from "./event-readiness-notice";
import { TemplateChoiceFields } from "./template-choice-fields";

type EventSectionsProps = {
  event: Event;
  templates: Template[];
  eventGuests: Page<EventGuest>;
  readiness: EventReadiness | null;
  sections: EventSectionsState;
  eventForm: EventFormState;
};

export function EventSections({
  event,
  templates,
  eventGuests,
  readiness,
  sections,
  eventForm,
}: EventSectionsProps) {
  const { section, opened, bodyRef, changeSection } = sections;

  return (
    <DialogBody ref={bodyRef}>
      {readiness && <EventReadinessNotice readiness={readiness} onSection={changeSection} />}
      {/* Details and templates are one form, saved together, so the template selects are always
        mounted: a save without them would clear the event's templates. Guests save on their own. */}
      <form {...eventForm.formProps}>
        <div hidden={section !== "details"} className="grid gap-6">
          <EventDetailsFields fields={eventForm.fields} />
        </div>
        <div hidden={section !== "templates"} className="grid gap-6">
          <TemplateChoiceFields
            event={event}
            templates={templates}
            fields={eventForm.fields}
            showPreviews={opened.has("templates")}
          />
        </div>
      </form>
      {opened.has("guests") && (
        <div hidden={section !== "guests"}>
          <EventGuestsSection event={event} eventGuests={eventGuests} />
        </div>
      )}
    </DialogBody>
  );
}
