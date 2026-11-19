import { z } from "zod";

import { TextLimit } from "@/shared/config";
import { localDateTime, requiredText } from "@/shared/lib/forms";

export const eventFields = ["name", "startsAtLocal"] as const;
export type EventField = (typeof eventFields)[number];
export type EventFormValues = Record<EventField, string>;

export const eventFormSchema = z.object({
  name: requiredText(TextLimit.short, "Podaj nazwę wydarzenia."),
  startsAtLocal: localDateTime("Podaj datę i godzinę wydarzenia."),
});

export const emptyEventFormValues: EventFormValues = { name: "", startsAtLocal: "" };

export type EventFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<EventField, string>>;
      values: EventFormValues;
    };

export const initialEventFormState: EventFormState = { status: "idle" };
