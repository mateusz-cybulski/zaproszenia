import { TextLimit } from "@/shared/config";

import { countryCode } from "./country-code";
import { optionalText } from "./optional-text";

export const addressSchemaShape = {
  street: optionalText(TextLimit.short),
  postalCode: optionalText(TextLimit.postalCode),
  city: optionalText(TextLimit.city),
  country: countryCode,
};
