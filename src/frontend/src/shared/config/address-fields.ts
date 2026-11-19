import type { FormFieldConfig } from "@/shared/ui/form-field";

import { countries } from "./countries";
import { TextLimit } from "./text-limit";

export type AddressField = "street" | "postalCode" | "city" | "country";

export const addressFields: FormFieldConfig<AddressField>[] = [
  { name: "street", label: "Ulica i numer", maxLength: TextLimit.short },
  { name: "postalCode", label: "Kod pocztowy", maxLength: TextLimit.postalCode },
  { name: "city", label: "Miejscowość", maxLength: TextLimit.city },
  {
    name: "country",
    label: "Kraj",
    options: countries.map((country) => ({ value: country.code, label: country.name })),
  },
];
