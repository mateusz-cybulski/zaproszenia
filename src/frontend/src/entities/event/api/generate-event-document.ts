import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { EventDocumentKind } from "../model/event-document";
import type { EventId } from "../model/event-id";

export function generateEventDocument(
  id: EventId,
  kind: EventDocumentKind,
  confirmed: boolean,
): Promise<Response> {
  return apiFetch(`/events/${id}/documents/${kind}`, {
    method: "POST",
    body: JSON.stringify({ confirmed }),
    onUnauthorized: "return",
  });
}
