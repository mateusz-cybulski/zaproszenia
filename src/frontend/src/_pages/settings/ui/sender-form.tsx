"use client";

import { useActionState } from "react";

import type { Sender } from "@/entities/viewer";
import { Button } from "@/shared/ui/button";
import { FormField, type FormFieldConfig } from "@/shared/ui/form-field";

import { updateSenderAction } from "../api/update-sender-action";
import { settingsMessages } from "../config/messages";
import { senderAddressFields, senderNameField } from "../config/sender-fields";
import {
  initialSenderFormValues,
  type SenderField,
  type SenderFormState,
} from "../model/sender-form";

export function SenderForm({ sender }: { sender: Sender }) {
  const [state, formAction, pending] = useActionState<SenderFormState, FormData>(
    updateSenderAction,
    { status: "idle" },
  );
  const errors = state.status === "error" ? state.fieldErrors : {};
  // React resets the form after every submit; these defaults keep what the user typed.
  const values = state.status === "idle" ? initialSenderFormValues(sender) : state.values;

  const renderField = (field: FormFieldConfig<SenderField>) => (
    <FormField
      key={field.name}
      id={`sender-${field.name}`}
      field={field}
      defaultValue={values[field.name]}
      error={errors[field.name]}
    />
  );

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      {renderField(senderNameField)}
      <fieldset className="grid gap-4">
        <legend className="mb-4 text-sm font-medium">Adres zwrotny</legend>
        <div className="grid grid-cols-2 gap-4">{senderAddressFields.map(renderField)}</div>
      </fieldset>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : "Zapisz"}
        </Button>
        <p role="status" className="text-sm text-muted-foreground">
          {state.status === "saved" && settingsMessages.saved}
          {state.status === "error" && <span className="text-destructive">{state.message}</span>}
        </p>
      </div>
    </form>
  );
}
