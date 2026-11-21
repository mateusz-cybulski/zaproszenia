"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  type Event,
  type EventDocumentKind,
  type EventDocumentProblem,
  eventDocumentErrorSchema,
} from "@/entities/event";
import { saveBlob } from "@/shared/lib/download";
import { routes } from "@/shared/routes";

import { EVENT_DOCUMENTS_COPY } from "../config/messages";

type Confirmation = { kind: EventDocumentKind; problem: EventDocumentProblem };

async function readProblem(response: Response): Promise<EventDocumentProblem | null> {
  if (response.status !== 409) {
    return null;
  }
  const body = eventDocumentErrorSchema.safeParse(await response.json().catch(() => null));
  return body.success ? body.data.detail : null;
}

// Generates and downloads invitations or envelopes; warnings come back for confirmation.
export function useEventDocument(event: Event) {
  const router = useRouter();
  const [pending, setPending] = useState<EventDocumentKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  async function generate(kind: EventDocumentKind, confirmed = false) {
    setError(null);
    setConfirmation(null);
    setPending(kind);
    try {
      const response = await fetch(routes.eventDocument(event.id, kind), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed }),
      });
      if (response.ok) {
        saveBlob(await response.blob(), EVENT_DOCUMENTS_COPY.fileName(kind, event.name));
        // Generated invitations change the guests' status on the list.
        router.refresh();
        return;
      }
      const problem = await readProblem(response);
      if (problem?.code === "needs_confirmation") {
        setConfirmation({ kind, problem });
      } else if (problem?.code === "no_guests") {
        setError(EVENT_DOCUMENTS_COPY.noGuests);
      } else if (problem?.code === "no_template") {
        setError(EVENT_DOCUMENTS_COPY.noTemplate(kind));
      } else {
        setError(EVENT_DOCUMENTS_COPY.failed);
      }
    } catch {
      setError(EVENT_DOCUMENTS_COPY.failed);
    } finally {
      setPending(null);
    }
  }

  return { generate, pending, error, confirmation, cancel: () => setConfirmation(null) };
}
