"use client";

import type { Event } from "@/entities/event";
import type { Template } from "@/entities/template";

import { EVENT_SECTION_COPY } from "../config/messages";
import type { TemplateChoiceFormState } from "../model/use-template-choice-form";
import { TemplateChoice } from "./template-choice";

type TemplateChoiceFormProps = {
  event: Event;
  templates: Template[];
  templateForm: TemplateChoiceFormState;
};

export function TemplateChoiceForm({ event, templates, templateForm }: TemplateChoiceFormProps) {
  const { fields, formProps } = templateForm;

  return (
    <form {...formProps} className="grid gap-6">
      <p className="text-sm text-muted-foreground">{EVENT_SECTION_COPY.templatesDescription}</p>
      <div className="grid grid-cols-2 items-start gap-6">
        <TemplateChoice
          eventId={event.id}
          kind="invitation"
          label="Szablon zaproszenia"
          templates={templates}
          meta={fields.invitationTemplateId}
        />
        <TemplateChoice
          eventId={event.id}
          kind="envelope"
          label="Szablon koperty"
          templates={templates}
          meta={fields.envelopeTemplateId}
        />
      </div>
    </form>
  );
}
