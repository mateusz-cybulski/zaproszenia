import { z } from "zod";

import { countryCodes } from "@/shared/config";

export const countryCode = z
  .string()
  .refine((code) => countryCodes.includes(code), "Wybierz kraj z listy.");
