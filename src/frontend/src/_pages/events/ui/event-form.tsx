"use client";

import type { Event } from "@/entities/event";
import { ADDRESS_FIELDS } from "@/shared/config";
import { useServerForm } from "@/shared/lib/server-form";
import { Button } from "@/shared/ui/button";
import { FormField, type FormFieldConfig } from "@/shared/ui/form-field";
import { FormStatus } from "@/shared/ui/form-status";

import { createEventAction } from "../api/create-event-action";
import { updateEventAction } from "../api/update-event-action";
import {
  INVITATION_TEXT_FIELD,
  NAME_FIELD,
  STARTS_AT_FIELD,
  VENUE_FIELD,
} from "../config/event-fields";
import { EVENT_FORM_COPY } from "../config/messages";
import { type EventField, eventFormDefaults, eventFormSchema } from "../model/event-form";

type EventFormProps = { event?: Event; onSaved?: () => void };

export function EventForm({ event, onSaved }: EventFormProps) {
  const { fields, formProps, pending, lastResult } = useServerForm({
    schema: eventFormSchema,
    action: event ? updateEventAction.bind(null, event.id) : createEventAction,
    defaultValue: eventFormDefaults(event),
    onSuccess: onSaved,
  });

  const renderField = (field: FormFieldConfig<EventField>) => (
    <FormField key={field.name} field={field} meta={fields[field.name]} />
  );

  return (
    <form {...formProps} className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">
        {renderField(NAME_FIELD)}
        {renderField(STARTS_AT_FIELD)}
      </div>

      <fieldset className="grid gap-4">
        <legend className="mb-4 text-sm font-medium">{EVENT_FORM_COPY.place}</legend>
        {renderField(VENUE_FIELD)}
        <div className="grid grid-cols-2 gap-4">{ADDRESS_FIELDS.map(renderField)}</div>
      </fieldset>

      {renderField(INVITATION_TEXT_FIELD)}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : event ? "Zapisz zmiany" : "Utwórz wydarzenie"}
        </Button>
        <FormStatus result={lastResult} />
      </div>
    </form>
  );
}
