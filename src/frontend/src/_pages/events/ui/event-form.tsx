"use client";

import { getFormProps } from "@conform-to/react";

import { useServerForm } from "@/shared/lib/server-form";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { FormStatus } from "@/shared/ui/form-status";

import { createEventAction } from "../api/create-event-action";
import { NEW_EVENT_FIELDS } from "../config/event-fields";
import { eventFormSchema } from "../model/event-form";

export function EventForm({ onSaved }: { onSaved?: () => void }) {
  const { form, fields, formAction, pending, lastResult } = useServerForm({
    schema: eventFormSchema,
    action: createEventAction,
    onSuccess: onSaved,
  });

  return (
    <form {...getFormProps(form)} action={formAction} className="grid gap-6">
      <div className="grid gap-4">
        {NEW_EVENT_FIELDS.map((field) => (
          <FormField key={field.name} field={field} meta={fields[field.name]} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Tworzenie…" : "Utwórz wydarzenie"}
        </Button>
        <FormStatus result={lastResult} />
      </div>
    </form>
  );
}
