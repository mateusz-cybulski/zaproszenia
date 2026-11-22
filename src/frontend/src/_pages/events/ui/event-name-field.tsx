"use client";

import { DialogNameField } from "@/shared/ui/dialog-name-field";

import { NAME_FIELD } from "../config/event-fields";
import type { EventFormState } from "../model/use-event-form";

export function EventNameField({ eventForm, title }: { eventForm: EventFormState; title: string }) {
  const meta = eventForm.fields[NAME_FIELD.name];

  return (
    <DialogNameField
      key={meta.key}
      label={NAME_FIELD.label}
      title={title}
      form={eventForm.form.id}
      id={meta.id}
      name={meta.name}
      defaultValue={meta.defaultValue ?? ""}
      placeholder={NAME_FIELD.label}
      maxLength={NAME_FIELD.maxLength}
      aria-required
      error={meta.errors?.[0]}
      errorId={meta.errorId}
    />
  );
}
