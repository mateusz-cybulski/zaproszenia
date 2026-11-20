"use client";

import { ADDRESS_FIELDS } from "@/shared/config";
import { FormField, type FormFieldConfig } from "@/shared/ui/form-field";

import { INVITATION_TEXT_FIELD, STARTS_AT_FIELD, VENUE_FIELD } from "../config/event-fields";
import { EVENT_FORM_COPY } from "../config/messages";
import type { EventField } from "../model/event-form";
import type { EventFormState } from "../model/use-event-form";

export function EventForm({ eventForm }: { eventForm: EventFormState }) {
  const { fields, formProps } = eventForm;

  const renderField = (field: FormFieldConfig<EventField>) => (
    <FormField key={field.name} field={field} meta={fields[field.name]} />
  );

  return (
    <form {...formProps} className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">{renderField(STARTS_AT_FIELD)}</div>

      <fieldset className="grid gap-4">
        <legend className="mb-4 text-sm font-medium">{EVENT_FORM_COPY.place}</legend>
        {renderField(VENUE_FIELD)}
        <div className="grid grid-cols-2 gap-4">{ADDRESS_FIELDS.map(renderField)}</div>
      </fieldset>

      {renderField(INVITATION_TEXT_FIELD)}
    </form>
  );
}
