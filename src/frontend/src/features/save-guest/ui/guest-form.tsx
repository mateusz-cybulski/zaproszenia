"use client";

import { useActionState } from "react";

import type { Guest } from "@/entities/guest";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { createGuestAction, updateGuestAction } from "../api/actions";
import { initialGuestFormState } from "../model/guest-form";

type GuestFormProps = {
  /** Edits this guest; without it the form creates a new one. */
  guest?: Guest;
};

export function GuestForm({ guest }: GuestFormProps) {
  const action = guest ? updateGuestAction.bind(null, guest.id) : createGuestAction;
  const [state, formAction, pending] = useActionState(action, initialGuestFormState);

  const errors = state.status === "error" ? state.fieldErrors : {};
  // React resets the form after every submit; these defaults restore what the user typed on errors.
  const values =
    state.status === "error"
      ? state.values
      : { name: guest?.name ?? "", email: guest?.email ?? "" };

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="guest-name">Imię i nazwisko</Label>
        <Input
          id="guest-name"
          name="name"
          defaultValue={values.name}
          autoComplete="name"
          required
          maxLength={200}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "guest-name-error" : undefined}
        />
        {errors.name && (
          <p id="guest-name-error" className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="guest-email">E-mail (opcjonalnie)</Label>
        <Input
          id="guest-email"
          name="email"
          type="email"
          defaultValue={values.email}
          autoComplete="email"
          maxLength={320}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "guest-email-error" : undefined}
        />
        {errors.email && (
          <p id="guest-email-error" className="text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

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
