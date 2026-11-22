import { z } from "zod";

import type { Event } from "@/entities/event";
import { templateIdSchema } from "@/entities/template";
import { TEXT_LIMIT } from "@/shared/config";
import { toLocalDateTimeInput } from "@/shared/lib/dates";
import { addressSchemaShape, localDateTime, optionalText, requiredText } from "@/shared/lib/forms";
import { recordIdParamSchema } from "@/shared/lib/record-id";

// What a new event is created with; the API picks the system templates for it.
export const eventDetailsSchema = z.object({
  name: requiredText(TEXT_LIMIT.short, "Podaj nazwę wydarzenia."),
  startsAtLocal: localDateTime("Podaj datę i godzinę wydarzenia."),
  venueName: optionalText(TEXT_LIMIT.short),
  // Browsers submit textarea line breaks as \r\n; the invitation PDF expects \n.
  invitationText: optionalText(TEXT_LIMIT.long).transform(
    (text) => text?.replace(/\r\n?/g, "\n") ?? null,
  ),
  ...addressSchemaShape,
});

// An empty choice ("Brak") arrives as undefined and means no template.
const templateChoice = recordIdParamSchema
  .pipe(templateIdSchema)
  .optional()
  .transform((id) => id ?? null);

// An existing event saves its details and its templates together.
export const eventFormSchema = eventDetailsSchema.extend({
  invitationTemplateId: templateChoice,
  envelopeTemplateId: templateChoice,
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
    invitationTemplateId: event?.invitationTemplateId?.toString() ?? "",
    envelopeTemplateId: event?.envelopeTemplateId?.toString() ?? "",
  };
}
