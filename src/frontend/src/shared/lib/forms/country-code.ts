import { z } from "zod";

import { COUNTRY_CODES } from "@/shared/config";

const CHOOSE_COUNTRY = "Wybierz kraj z listy.";

export const countryCode = z
  .string({ error: CHOOSE_COUNTRY })
  .refine((code) => COUNTRY_CODES.includes(code), CHOOSE_COUNTRY);
