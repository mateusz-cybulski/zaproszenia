import { TextLimit } from "@/shared/config";
import type { FormFieldConfig } from "@/shared/ui/form-field";

import type { EventField } from "../model/event-form";

export const newEventFields: FormFieldConfig<EventField>[] = [
  { name: "name", label: "Nazwa", maxLength: TextLimit.short },
  {
    name: "startsAtLocal",
    label: "Data i godzina",
    inputType: "datetime-local",
    hint: "Czas lokalny wydarzenia (Polska).",
  },
];
