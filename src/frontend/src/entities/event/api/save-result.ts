import type { Event } from "../model/event";
import { type EventDto, toEvent } from "./event-dto";

export type SaveEventFailure = { ok: false; reason: "not-found" | "invalid" | "unavailable" };

export type SaveEventResult = { ok: true; event: Event } | SaveEventFailure;

export async function toSaveResult(response: Response | null): Promise<SaveEventResult> {
  if (response?.ok) {
    return { ok: true, event: toEvent((await response.json()) as EventDto) };
  }
  if (response?.status === 404) {
    return { ok: false, reason: "not-found" };
  }
  if (response?.status === 422) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: false, reason: "unavailable" };
}
