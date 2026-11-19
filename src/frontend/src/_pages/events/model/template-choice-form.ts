import { z } from "zod";

import type { Event } from "@/entities/event";
import { templateIdSchema } from "@/entities/template";
import { recordIdParamSchema } from "@/shared/lib/record-id";

// An empty choice ("Brak") arrives as undefined and means no template.
const templateChoice = recordIdParamSchema
  .pipe(templateIdSchema)
  .optional()
  .transform((id) => id ?? null);

export const templateChoiceSchema = z.object({
  invitationTemplateId: templateChoice,
  envelopeTemplateId: templateChoice,
});

export function templateChoiceDefaults(event: Event) {
  return {
    invitationTemplateId: event.invitationTemplateId?.toString() ?? "",
    envelopeTemplateId: event.envelopeTemplateId?.toString() ?? "",
  };
}
