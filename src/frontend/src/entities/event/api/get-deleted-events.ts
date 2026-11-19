import "server-only";

import { apiFetch } from "@/shared/api/index.server";

import type { Event } from "../model/event";
import { type EventDto, toEvent } from "./event-dto";

export async function getDeletedEvents(): Promise<Event[]> {
  const response = await apiFetch("/events?deleted=true");
  if (!response.ok) {
    throw new Error(`GET /events?deleted=true failed with ${response.status}`);
  }
  return ((await response.json()) as EventDto[]).map(toEvent);
}
