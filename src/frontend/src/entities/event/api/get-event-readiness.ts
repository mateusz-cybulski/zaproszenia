import "server-only";

import { z } from "zod";

import { apiFetchOrNull, parseResponse } from "@/shared/api/index.server";

import type { EventId } from "../model/event-id";
import type { EventReadiness } from "../model/event-readiness";

const readinessSchema = z
  .object({
    guests: z.int(),
    unverified: z.int(),
    without_address: z.int(),
    invitation_template: z.boolean(),
    envelope_template: z.boolean(),
    sender_complete: z.boolean(),
  })
  .transform((dto): EventReadiness => ({
    guests: dto.guests,
    unverified: dto.unverified,
    withoutAddress: dto.without_address,
    invitationTemplate: dto.invitation_template,
    envelopeTemplate: dto.envelope_template,
    senderComplete: dto.sender_complete,
  }));

// Null when it cannot be read: the dialog then simply shows no warnings.
export async function getEventReadiness(id: EventId): Promise<EventReadiness | null> {
  const response = await apiFetchOrNull(`/events/${id}/readiness`);
  if (!response?.ok) {
    return null;
  }
  return parseResponse(response, readinessSchema);
}
