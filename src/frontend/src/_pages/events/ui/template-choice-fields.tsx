"use client";

import type { Event } from "@/entities/event";
import type { Template } from "@/entities/template";

import { EVENT_SECTION_COPY } from "../config/messages";
import type { EventFormState } from "../model/use-event-form";
import { TemplateChoice } from "./template-choice";

type TemplateChoiceFieldsProps = {
  event: Event;
  templates: Template[];
  fields: EventFormState["fields"];
  showPreviews: boolean;
};

export function TemplateChoiceFields({
  event,
  templates,
  fields,
  showPreviews,
}: TemplateChoiceFieldsProps) {
  return (
    <>
      <p className="text-sm text-muted-foreground">{EVENT_SECTION_COPY.templatesDescription}</p>
      <div className="grid grid-cols-2 items-start gap-6">
        <TemplateChoice
          eventId={event.id}
          kind="invitation"
          label="Szablon zaproszenia"
          templates={templates}
          meta={fields.invitationTemplateId}
          showPreview={showPreviews}
        />
        <TemplateChoice
          eventId={event.id}
          kind="envelope"
          label="Szablon koperty"
          templates={templates}
          meta={fields.envelopeTemplateId}
          showPreview={showPreviews}
        />
      </div>
    </>
  );
}
