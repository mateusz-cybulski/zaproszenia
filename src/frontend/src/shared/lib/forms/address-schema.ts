import { TEXT_LIMIT } from "@/shared/config";

import { countryCode } from "./country-code";
import { optionalText } from "./optional-text";

export const addressSchemaShape = {
  street: optionalText(TEXT_LIMIT.short),
  postalCode: optionalText(TEXT_LIMIT.postalCode),
  city: optionalText(TEXT_LIMIT.city),
  country: countryCode,
};
