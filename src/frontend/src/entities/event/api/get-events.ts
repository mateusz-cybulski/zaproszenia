import "server-only";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { Event } from "../model/event";
import { eventListSchema } from "./event-dto";

export async function getEvents(): Promise<Event[]> {
  const response = await apiFetch("/events");
  if (!response.ok) {
    throw new Error(`GET /events failed with ${response.status}`);
  }
  return parseResponse(response, eventListSchema);
}
