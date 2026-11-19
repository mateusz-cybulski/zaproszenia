import { z } from "zod";

import { type EventId, eventIdSchema } from "../model/event-id";

export type SaveEventFailure = { ok: false; reason: "not-found" | "invalid" | "unavailable" };

// Only the id is read back, to open a new event; an unexpected body yields null, not a failure,
// since the write already happened.
export type SaveEventResult = { ok: true; id: EventId | null } | SaveEventFailure;

const savedEventSchema = z.object({ id: eventIdSchema });

export async function toSaveResult(response: Response | null): Promise<SaveEventResult> {
  if (response?.ok) {
    const saved = savedEventSchema.safeParse(await response.json().catch(() => null));
    return { ok: true, id: saved.success ? saved.data.id : null };
  }
  if (response?.status === 404) {
    return { ok: false, reason: "not-found" };
  }
  if (response?.status === 422) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: false, reason: "unavailable" };
}
