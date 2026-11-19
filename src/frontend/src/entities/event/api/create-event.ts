import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { EventDraft } from "../model/event";
import { toEventDraftBody } from "./event-dto";
import { type SaveEventResult, toSaveResult } from "./save-result";

export async function createEvent(draft: EventDraft): Promise<SaveEventResult> {
  const body = JSON.stringify(toEventDraftBody(draft));
  return toSaveResult(await apiFetchOrNull("/events", { method: "POST", body }));
}
