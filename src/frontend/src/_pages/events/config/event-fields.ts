import { TEXT_LIMIT } from "@/shared/config";
import type { FormFieldConfig } from "@/shared/ui/form-field";

import type { EventField } from "../model/event-form";

export const NEW_EVENT_FIELDS: FormFieldConfig<EventField>[] = [
  { name: "name", label: "Nazwa", maxLength: TEXT_LIMIT.short },
  {
    name: "startsAtLocal",
    label: "Data i godzina",
    inputType: "datetime-local",
    hint: "Czas lokalny wydarzenia (Polska).",
  },
];
