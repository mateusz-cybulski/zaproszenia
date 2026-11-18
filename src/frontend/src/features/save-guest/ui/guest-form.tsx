"use client";

import { useActionState, useEffect } from "react";

import type { Guest } from "@/entities/guest";
import { Button } from "@/shared/ui/button";

import { createGuestAction, updateGuestAction } from "../api/actions";
import { addressFields, type FieldConfig, recipientFields } from "../config/guest-fields";
import { initialGuestFormState, initialGuestFormValues } from "../model/guest-form";
import { GuestFormField } from "./guest-form-field";

type GuestFormProps = {
  guest?: Guest;
  onCreated?: () => void;
};

export function GuestForm({ guest, onCreated }: GuestFormProps) {
  const action = guest ? updateGuestAction.bind(null, guest.id) : createGuestAction;
  const [state, formAction, pending] = useActionState(action, initialGuestFormState);

  const errors = state.status === "error" ? state.fieldErrors : {};
  // React resets the form after every submit; these defaults restore what the user typed on errors.
  const values = state.status === "error" ? state.values : initialGuestFormValues(guest);
  useEffect(() => {
    if (state.status === "success") {
      onCreated?.();
    }
  }, [state, onCreated]);

  const idPrefix = guest ? `guest-${guest.id}` : "guest-new";

  const renderField = (field: FieldConfig) => (
    <GuestFormField
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
