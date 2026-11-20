"use client";

import type { Event } from "@/entities/event";
import { useServerForm } from "@/shared/lib/server-form";

import { createEventAction } from "../api/create-event-action";
import { updateEventAction } from "../api/update-event-action";
import { eventFormDefaults, eventFormSchema } from "./event-form";

// Owned by the dialog: the name field and the save button sit in its header, outside the <form>.
export function useEventForm(event: Event | undefined, onSaved: () => void) {
  return useServerForm({
    schema: eventFormSchema,
    action: event ? updateEventAction.bind(null, event.id) : createEventAction,
    defaultValue: eventFormDefaults(event),
    onSuccess: onSaved,
  });
}

export type EventFormState = ReturnType<typeof useEventForm>;
