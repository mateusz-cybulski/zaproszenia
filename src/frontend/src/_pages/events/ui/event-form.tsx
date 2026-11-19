"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

import { createEventAction } from "../api/create-event-action";
import { newEventFields } from "../config/event-fields";
import { emptyEventFormValues, initialEventFormState } from "../model/event-form";

export function EventForm({ onSaved }: { onSaved?: () => void }) {
  const [state, formAction, pending] = useActionState(createEventAction, initialEventFormState);

  const errors = state.status === "error" ? state.fieldErrors : {};
  // React resets the form after every submit; these defaults restore what the user typed on errors.
  const values = state.status === "error" ? state.values : emptyEventFormValues;
  useEffect(() => {
    if (state.status === "success") {
      onSaved?.();
    }
  }, [state, onSaved]);

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      <div className="grid gap-4">
        {newEventFields.map((field) => (
          <FormField
            key={field.name}
            id={`event-new-${field.name}`}
            field={field}
            defaultValue={values[field.name]}
            error={errors[field.name]}
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Tworzenie…" : "Utwórz wydarzenie"}
        </Button>
        <p role="status" className="text-sm text-muted-foreground">
          {state.status === "error" && <span className="text-destructive">{state.message}</span>}
        </p>
      </div>
    </form>
  );
}
