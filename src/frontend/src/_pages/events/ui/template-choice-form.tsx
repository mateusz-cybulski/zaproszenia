"use client";

import type { Event } from "@/entities/event";
import type { Template } from "@/entities/template";
import { useServerForm } from "@/shared/lib/server-form";
import { Button } from "@/shared/ui/button";
import { FormStatus } from "@/shared/ui/form-status";

import { setEventTemplatesAction } from "../api/set-event-templates-action";
import { EVENT_SECTION_COPY } from "../config/messages";
import { templateChoiceDefaults, templateChoiceSchema } from "../model/template-choice-form";
import { TemplateChoice } from "./template-choice";

type TemplateChoiceFormProps = { event: Event; templates: Template[] };

export function TemplateChoiceForm({ event, templates }: TemplateChoiceFormProps) {
  const { fields, formProps, pending, lastResult } = useServerForm({
    schema: templateChoiceSchema,
    action: setEventTemplatesAction.bind(null, event.id),
    defaultValue: templateChoiceDefaults(event),
  });

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
      <div className="flex items-center gap-3">
        <Button type="submit" aria-disabled={pending}>
          {pending ? "Zapisywanie…" : "Zapisz szablony"}
        </Button>
        <FormStatus result={lastResult} successMessage={EVENT_SECTION_COPY.templatesSaved} />
      </div>
    </form>
  );
}
