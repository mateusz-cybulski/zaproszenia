import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { Event, EventInput } from "../model/event";
import { toEventBody } from "./event-dto";
import { type SaveEventResult, toSaveResult } from "./save-result";

// PUT replaces the whole event, so the templates it has now go along unchanged.
export async function updateEvent(event: Event, input: EventInput): Promise<SaveEventResult> {
  const body = JSON.stringify({
    ...toEventBody(input),
    invitation_template_id: event.invitationTemplateId,
    envelope_template_id: event.envelopeTemplateId,
  });
  return toSaveResult(await apiFetchOrNull(`/events/${event.id}`, { method: "PUT", body }));
}
