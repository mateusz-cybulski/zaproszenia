"use client";

import type { Guest } from "@/entities/guest";
import { ADDRESS_FIELDS } from "@/shared/config";
import { useServerForm } from "@/shared/lib/server-form";
import { Button } from "@/shared/ui/button";
import { FormField, type FormFieldConfig } from "@/shared/ui/form-field";
import { FormStatus } from "@/shared/ui/form-status";

import { createGuestAction } from "../api/create-guest-action";
import { updateGuestAction } from "../api/update-guest-action";
import { RECIPIENT_FIELDS } from "../config/guest-fields";
import { type GuestField, guestFormDefaults, guestFormSchema } from "../model/guest-form";

type GuestFormProps = {
  guest?: Guest;
  onSaved?: () => void;
};

export function GuestForm({ guest, onSaved }: GuestFormProps) {
  const { fields, formProps, pending, lastResult } = useServerForm({
    schema: guestFormSchema,
    action: guest ? updateGuestAction.bind(null, guest.id) : createGuestAction,
    defaultValue: guestFormDefaults(guest),
    onSuccess: onSaved,
  });

  const renderField = (field: FormFieldConfig<GuestField>) => (
    <FormField key={field.name} field={field} meta={fields[field.name]} />
  );

  return (
    <form {...formProps} className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">{RECIPIENT_FIELDS.map(renderField)}</div>

      <fieldset className="grid gap-4">
        <legend className="mb-4 text-sm font-medium">Adres pocztowy (opcjonalnie)</legend>
        <div className="grid grid-cols-2 gap-4">{ADDRESS_FIELDS.map(renderField)}</div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : guest ? "Zapisz zmiany" : "Dodaj gościa"}
        </Button>
        <FormStatus result={lastResult} />
      </div>
    </form>
  );
}
