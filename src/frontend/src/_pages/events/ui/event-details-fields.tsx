"use client";

import { ADDRESS_FIELDS } from "@/shared/config";
import { FormField, type FormFieldConfig } from "@/shared/ui/form-field";

import { INVITATION_TEXT_FIELD, STARTS_AT_FIELD, VENUE_FIELD } from "../config/event-fields";
import { EVENT_FORM_COPY } from "../config/messages";
import type { EventField } from "../model/event-form";
import type { EventFormState } from "../model/use-event-form";

// Inside the dialog's <form>: the new event's alone, the existing event's with the template choice.
export function EventDetailsFields({ fields }: { fields: EventFormState["fields"] }) {
  const renderField = (field: FormFieldConfig<EventField>) => (
    <FormField key={field.name} field={field} meta={fields[field.name]} />
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-4">{renderField(STARTS_AT_FIELD)}</div>

      <fieldset className="grid gap-4">
        <legend className="mb-4 text-sm font-medium">{EVENT_FORM_COPY.place}</legend>
        {renderField(VENUE_FIELD)}
        <div className="grid grid-cols-2 gap-4">{ADDRESS_FIELDS.map(renderField)}</div>
      </fieldset>

      {renderField(INVITATION_TEXT_FIELD)}
    </>
  );
}
