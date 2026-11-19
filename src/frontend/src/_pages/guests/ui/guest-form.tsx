"use client";

import { useActionState, useEffect } from "react";

import type { Guest } from "@/entities/guest";
import { addressFields } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { FormField, type FormFieldConfig } from "@/shared/ui/form-field";

import { createGuestAction } from "../api/create-guest-action";
import { updateGuestAction } from "../api/update-guest-action";
import { recipientFields } from "../config/guest-fields";
import {
  type GuestField,
  initialGuestFormState,
  initialGuestFormValues,
} from "../model/guest-form";

type GuestFormProps = {
  guest?: Guest;
  onSaved?: () => void;
};

export function GuestForm({ guest, onSaved }: GuestFormProps) {
  const action = guest ? updateGuestAction.bind(null, guest.id) : createGuestAction;
  const [state, formAction, pending] = useActionState(action, initialGuestFormState);

  const errors = state.status === "error" ? state.fieldErrors : {};
  // React resets the form after every submit; these defaults restore what the user typed on errors.
  const values = state.status === "error" ? state.values : initialGuestFormValues(guest);
  useEffect(() => {
    if (state.status === "success") {
      onSaved?.();
    }
  }, [state, onSaved]);

  const idPrefix = guest ? `guest-${guest.id}` : "guest-new";

  const renderField = (field: FormFieldConfig<GuestField>) => (
    <FormField
      key={field.name}
      id={`${idPrefix}-${field.name}`}
      field={field}
      defaultValue={values[field.name]}
      error={errors[field.name]}
    />
  );

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      <div className="grid grid-cols-2 gap-4">{recipientFields.map(renderField)}</div>

      <fieldset className="grid gap-4">
        <legend className="mb-4 text-sm font-medium">Adres pocztowy (opcjonalnie)</legend>
        <div className="grid grid-cols-2 gap-4">{addressFields.map(renderField)}</div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : guest ? "Zapisz zmiany" : "Dodaj gościa"}
        </Button>
        <p role="status" className="text-sm text-muted-foreground">
          {state.status === "error" && <span className="text-destructive">{state.message}</span>}
        </p>
      </div>
    </form>
  );
}
