import { z } from "zod";

import type { Event } from "@/entities/event";
import { TEXT_LIMIT } from "@/shared/config";
import { toLocalDateTimeInput } from "@/shared/lib/dates";
import { addressSchemaShape, localDateTime, optionalText, requiredText } from "@/shared/lib/forms";

export const eventFormSchema = z.object({
  name: requiredText(TEXT_LIMIT.short, "Podaj nazwę wydarzenia."),
  startsAtLocal: localDateTime("Podaj datę i godzinę wydarzenia."),
  venueName: optionalText(TEXT_LIMIT.short),
  // Browsers submit textarea line breaks as \r\n; the invitation PDF expects \n.
  invitationText: optionalText(TEXT_LIMIT.long).transform(
    (text) => text?.replace(/\r\n?/g, "\n") ?? null,
  ),
  ...addressSchemaShape,
});

export type EventField = keyof z.input<typeof eventFormSchema>;

export function eventFormDefaults(event?: Event) {
  return {
    name: event?.name ?? "",
    startsAtLocal: event ? toLocalDateTimeInput(event.startsAt, event.timeZone) : "",
    venueName: event?.venueName ?? "",
    invitationText: event?.invitationText ?? "",
    street: event?.street ?? "",
    postalCode: event?.postalCode ?? "",
    city: event?.city ?? "",
    country: event?.country ?? "PL",
  };
}
