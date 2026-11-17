"use client";

import { useActionState } from "react";

import type { Guest } from "@/entities/guest";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { createGuestAction, updateGuestAction } from "../api/actions";
import { type GuestField, type GuestFormValues, initialGuestFormState } from "../model/guest-form";

type GuestFormProps = {
  /** Edits this guest; without it the form creates a new one. */
  guest?: Guest;
};

type FieldConfig = {
  name: GuestField;
  label: string;
  maxLength: number;
  hint?: string;
  autoComplete?: string;
};

const recipientFields: FieldConfig[] = [
  {
    name: "fullName",
    label: "Imię i nazwisko",
    maxLength: 300,
    hint: "Puste, gdy zapraszasz całą instytucję (np. redakcję).",
    autoComplete: "off",
  },
  { name: "position", label: "Stanowisko", maxLength: 300, autoComplete: "off" },
  { name: "institution", label: "Instytucja", maxLength: 300, autoComplete: "off" },
  {
    name: "salutation",
    label: "Zwrot grzecznościowy",
    maxLength: 300,
    hint: "Np. „Szanowny Panie Dyrektorze”.",
    autoComplete: "off",
  },
];

// The guest's address, not the user's own: browser autofill would offer the wrong one.
const addressFields: FieldConfig[] = [
  { name: "street", label: "Ulica i numer", maxLength: 300, autoComplete: "off" },
  { name: "postalCode", label: "Kod pocztowy", maxLength: 20, autoComplete: "off" },
  { name: "city", label: "Miejscowość", maxLength: 200, autoComplete: "off" },
  {
    name: "country",
    label: "Kraj",
    maxLength: 2,
    hint: "Dwuliterowy kod, np. PL, DE.",
    autoComplete: "off",
  },
];

function initialValues(guest?: Guest): GuestFormValues {
  return {
    fullName: guest?.fullName ?? "",
    position: guest?.position ?? "",
    institution: guest?.institution ?? "",
    salutation: guest?.salutation ?? "",
    street: guest?.street ?? "",
    postalCode: guest?.postalCode ?? "",
    city: guest?.city ?? "",
    country: guest?.country ?? "PL",
  };
}

export function GuestForm({ guest }: GuestFormProps) {
  const action = guest ? updateGuestAction.bind(null, guest.id) : createGuestAction;
  const [state, formAction, pending] = useActionState(action, initialGuestFormState);

  const errors = state.status === "error" ? state.fieldErrors : {};
  // React resets the form after every submit; these defaults restore what the user typed on errors.
  const values = state.status === "error" ? state.values : initialValues(guest);
  const idPrefix = guest ? `guest-${guest.id}` : "guest-new";

  function renderField(field: FieldConfig) {
    const id = `${idPrefix}-${field.name}`;
    const error = errors[field.name];
    const describedBy =
      [error ? `${id}-error` : null, field.hint ? `${id}-hint` : null].filter(Boolean).join(" ") ||
      undefined;
    return (
      <div key={field.name} className="grid content-start gap-2">
        <Label htmlFor={id}>{field.label}</Label>
        <Input
          id={id}
          name={field.name}
          defaultValue={values[field.name]}
          autoComplete={field.autoComplete}
          maxLength={field.maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {field.hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {field.hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">{recipientFields.map(renderField)}</div>

      <fieldset className="grid gap-4">
        <legend className="mb-4 text-sm font-medium">Adres pocztowy (opcjonalnie)</legend>
        <div className="grid gap-4 sm:grid-cols-2">{addressFields.map(renderField)}</div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : guest ? "Zapisz zmiany" : "Dodaj gościa"}
        </Button>
        <p role="status" className="text-sm text-muted-foreground">
          {state.status === "error" && <span className="text-destructive">{state.message}</span>}
          {state.status === "success" && "Dodano gościa."}
        </p>
      </div>
    </form>
  );
}
