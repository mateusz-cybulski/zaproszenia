import type { FormFieldConfig } from "@/shared/ui/form-field";

import { countries } from "./countries";

export type AddressField = "street" | "postalCode" | "city" | "country";

export const addressFields: FormFieldConfig<AddressField>[] = [
  { name: "street", label: "Ulica i numer", maxLength: 300 },
  { name: "postalCode", label: "Kod pocztowy", maxLength: 20 },
  { name: "city", label: "Miejscowość", maxLength: 200 },
  {
    name: "country",
    label: "Kraj",
    options: countries.map((country) => ({ value: country.code, label: country.name })),
  },
];
