import { type AddressField, addressFields, TextLimit } from "@/shared/config";
import type { FormFieldConfig } from "@/shared/ui/form-field";

import type { SenderField } from "../model/sender-form";

// The user's own address, so the browser may fill it in.
const autoComplete: Record<AddressField, string> = {
  street: "street-address",
  postalCode: "postal-code",
  city: "address-level2",
  country: "country",
};

export const senderNameField: FormFieldConfig<SenderField> = {
  name: "senderName",
  label: "Nazwa nadawcy",
  maxLength: TextLimit.short,
  hint: "Osoba lub organizacja, np. „Fundacja Przykładowa”.",
  autoComplete: "organization",
};

export const senderAddressFields: FormFieldConfig<SenderField>[] = addressFields.map((field) => ({
  ...field,
  autoComplete: autoComplete[field.name],
}));
