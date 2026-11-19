import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { EventInput } from "../model/event";
import { toEventBody } from "./event-dto";
import { type SaveEventResult, toSaveResult } from "./save-result";

// Without template ids the API picks the system templates.
export async function createEvent(input: EventInput): Promise<SaveEventResult> {
  const body = JSON.stringify(toEventBody(input));
  return toSaveResult(await apiFetchOrNull("/events", { method: "POST", body }));
}
