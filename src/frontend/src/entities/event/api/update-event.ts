import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { EventInput, EventTemplateChoice } from "../model/event";
import type { EventId } from "../model/event-id";
import { toEventBody } from "./event-dto";
import { type SaveEventResult, toSaveResult } from "./save-result";

export async function updateEvent(
  id: EventId,
  input: EventInput & EventTemplateChoice,
): Promise<SaveEventResult> {
  const body = JSON.stringify({
    ...toEventBody(input),
    invitation_template_id: input.invitationTemplateId,
    envelope_template_id: input.envelopeTemplateId,
  });
  return toSaveResult(await apiFetchOrNull(`/events/${id}`, { method: "PUT", body }));
}
