import { z } from "zod";

import { TEXT_LIMIT } from "@/shared/config";
import { localDateTime, requiredText } from "@/shared/lib/forms";

export const eventFormSchema = z.object({
  name: requiredText(TEXT_LIMIT.short, "Podaj nazwę wydarzenia."),
  startsAtLocal: localDateTime("Podaj datę i godzinę wydarzenia."),
});

export type EventField = keyof z.input<typeof eventFormSchema>;
