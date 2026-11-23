"use client";

import { FormField, type FormFieldConfig } from "@/shared/ui/form-field";

import { GUEST_ADDRESS_FIELDS, RECIPIENT_FIELDS } from "../config/guest-fields";
import type { GuestField } from "../model/guest-form";
import type { GuestFormState } from "../model/use-guest-form";

export function GuestForm({ guestForm }: { guestForm: GuestFormState }) {
  const { fields, formProps } = guestForm;

  const renderField = (field: FormFieldConfig<GuestField>) => (
    <FormField key={field.name} field={field} meta={fields[field.name]} />
  );

  return (
    <form {...formProps} className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">{RECIPIENT_FIELDS.map(renderField)}</div>

      <fieldset className="grid gap-4">
        <legend className="mb-4 text-sm font-medium">Adres pocztowy</legend>
        <div className="grid grid-cols-2 gap-4">{GUEST_ADDRESS_FIELDS.map(renderField)}</div>
      </fieldset>
    </form>
  );
}
