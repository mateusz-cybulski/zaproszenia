import { type AddressField, ADDRESS_FIELDS, TEXT_LIMIT } from "@/shared/config";
import type { FormFieldConfig } from "@/shared/ui/form-field";

import type { SenderField } from "../model/sender-form";

// The user's own address, so the browser may fill it in.
const AUTO_COMPLETE: Record<AddressField, string> = {
  street: "street-address",
  postalCode: "postal-code",
  city: "address-level2",
  country: "country",
};

export const SENDER_NAME_FIELD: FormFieldConfig<SenderField> = {
  name: "senderName",
  label: "Nazwa nadawcy",
  maxLength: TEXT_LIMIT.short,
  hint: "Osoba lub organizacja, np. „Fundacja Przykładowa”.",
  autoComplete: "organization",
};

export const SENDER_ADDRESS_FIELDS: FormFieldConfig<SenderField>[] = ADDRESS_FIELDS.map(
  (field) => ({
    ...field,
    autoComplete: AUTO_COMPLETE[field.name],
  }),
);
