import { TEXT_LIMIT } from "@/shared/config";
import type { FormFieldConfig } from "@/shared/ui/form-field";

import type { EventField } from "../model/event-form";

// Edited in the dialog's header.
export const NAME_FIELD = {
  name: "name",
  label: "Nazwa wydarzenia",
  maxLength: TEXT_LIMIT.short,
} as const satisfies { name: EventField; label: string; maxLength: number };

export const STARTS_AT_FIELD: FormFieldConfig<EventField> = {
  name: "startsAtLocal",
  label: "Data i godzina",
  required: true,
  inputType: "datetime-local",
  hint: "Czas lokalny wydarzenia (Polska).",
};

export const VENUE_FIELD: FormFieldConfig<EventField> = {
  name: "venueName",
  label: "Nazwa miejsca",
  maxLength: TEXT_LIMIT.short,
  hint: "Np. „Zamek Królewski”.",
};

export const INVITATION_TEXT_FIELD: FormFieldConfig<EventField> = {
  name: "invitationText",
  label: "Treść zaproszenia",
  maxLength: TEXT_LIMIT.long,
  multiline: true,
  rows: 4,
  hint: "Wstawiana w szablon w miejsce pola „Treść zaproszenia”.",
};
