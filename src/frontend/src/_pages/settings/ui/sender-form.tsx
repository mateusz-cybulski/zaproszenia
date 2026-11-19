"use client";

import type { Sender } from "@/entities/viewer";
import { useServerForm } from "@/shared/lib/server-form";
import { Button } from "@/shared/ui/button";
import { FormField, type FormFieldConfig } from "@/shared/ui/form-field";
import { FormStatus } from "@/shared/ui/form-status";

import { updateSenderAction } from "../api/update-sender-action";
import { SETTINGS_MESSAGES } from "../config/messages";
import { SENDER_ADDRESS_FIELDS, SENDER_NAME_FIELD } from "../config/sender-fields";
import { type SenderField, senderFormDefaults, senderFormSchema } from "../model/sender-form";

export function SenderForm({ sender }: { sender: Sender }) {
  const { fields, formProps, pending, lastResult } = useServerForm({
    schema: senderFormSchema,
    action: updateSenderAction,
    defaultValue: senderFormDefaults(sender),
  });

  const renderField = (field: FormFieldConfig<SenderField>) => (
    <FormField key={field.name} field={field} meta={fields[field.name]} />
  );

  return (
    <form {...formProps} className="grid gap-6">
      {renderField(SENDER_NAME_FIELD)}
      <fieldset className="grid gap-4">
        <legend className="mb-4 text-sm font-medium">Adres zwrotny</legend>
        <div className="grid grid-cols-2 gap-4">{SENDER_ADDRESS_FIELDS.map(renderField)}</div>
      </fieldset>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : "Zapisz"}
        </Button>
        <FormStatus result={lastResult} successMessage={SETTINGS_MESSAGES.saved} />
      </div>
    </form>
  );
}
