import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { EventTemplateChoice } from "../model/event";
import type { EventId } from "../model/event-id";
import { type SaveEventResult, toSaveResult } from "./save-result";

export async function setEventTemplates(
  id: EventId,
  choice: EventTemplateChoice,
): Promise<SaveEventResult> {
  const body = JSON.stringify({
    invitation_template_id: choice.invitationTemplateId,
    envelope_template_id: choice.envelopeTemplateId,
  });
  return toSaveResult(await apiFetchOrNull(`/events/${id}/templates`, { method: "PUT", body }));
}
