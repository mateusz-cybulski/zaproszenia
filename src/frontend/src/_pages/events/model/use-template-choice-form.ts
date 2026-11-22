"use client";

import type { Event } from "@/entities/event";
import { useServerForm } from "@/shared/lib/server-form";

import { setEventTemplatesAction } from "../api/set-event-templates-action";
import { templateChoiceDefaults, templateChoiceSchema } from "./template-choice-form";

// Owned by the dialog: generating a document asks first when the choice is not saved yet.
export function useTemplateChoiceForm(event: Event, onSaved: () => void) {
  return useServerForm({
    schema: templateChoiceSchema,
    action: setEventTemplatesAction.bind(null, event.id),
    defaultValue: templateChoiceDefaults(event),
    onSuccess: onSaved,
  });
}

export type TemplateChoiceFormState = ReturnType<typeof useTemplateChoiceForm>;
