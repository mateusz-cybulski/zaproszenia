import { ADDRESS_FIELDS, TEXT_LIMIT } from "@/shared/config";
import type { FormFieldConfig } from "@/shared/ui/form-field";

import type { GuestField } from "../model/guest-form";

// Edited in the dialog's header; empty when the whole institution is invited.
export const FULL_NAME_FIELD = {
  name: "fullName",
  label: "Imię i nazwisko",
  placeholder: "Imię i nazwisko (puste dla instytucji)",
  maxLength: TEXT_LIMIT.short,
} as const satisfies { name: GuestField; label: string; placeholder: string; maxLength: number };

export const RECIPIENT_FIELDS: FormFieldConfig<GuestField>[] = [
  { name: "position", label: "Stanowisko", maxLength: TEXT_LIMIT.short },
  { name: "institution", label: "Instytucja", maxLength: TEXT_LIMIT.short },
  {
    name: "salutation",
    label: "Zwrot grzecznościowy",
    maxLength: TEXT_LIMIT.short,
    hint: "Np. „Szanowny Panie Dyrektorze”.",
  },
];

export const GUEST_ADDRESS_FIELDS: FormFieldConfig<GuestField>[] = ADDRESS_FIELDS.map((field) =>
  field.name === "country" ? field : { ...field, required: true },
);
