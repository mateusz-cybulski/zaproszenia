import type { FormFieldConfig } from "@/shared/ui/form-field";

import { COUNTRIES } from "./countries";
import { TEXT_LIMIT } from "./text-limit";

export type AddressField = "street" | "postalCode" | "city" | "country";

export const ADDRESS_FIELDS: FormFieldConfig<AddressField>[] = [
  { name: "street", label: "Ulica i numer", maxLength: TEXT_LIMIT.short },
  { name: "postalCode", label: "Kod pocztowy", maxLength: TEXT_LIMIT.postalCode },
  { name: "city", label: "Miejscowość", maxLength: TEXT_LIMIT.city },
  {
    name: "country",
    label: "Kraj",
    options: COUNTRIES.map((country) => ({ value: country.code, label: country.name })),
  },
];
