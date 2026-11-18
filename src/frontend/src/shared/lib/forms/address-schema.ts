import { countryCode } from "./country-code";
import { optionalText } from "./optional-text";

export const addressSchemaShape = {
  street: optionalText(300),
  postalCode: optionalText(20),
  city: optionalText(200),
  country: countryCode,
};
