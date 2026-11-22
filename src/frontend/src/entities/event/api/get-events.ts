import "server-only";

import { type Page, pageSchema } from "@/shared/api";
import { apiFetch, parseResponse } from "@/shared/api/index.server";
import { withQuery } from "@/shared/routes";

import type { EventListItem } from "../model/event";
import { eventListItemDtoSchema } from "./event-dto";

type EventQuery = { page?: number; deleted?: boolean };

const eventPageSchema = pageSchema(eventListItemDtoSchema);

export async function getEvents({ page, deleted }: EventQuery = {}): Promise<Page<EventListItem>> {
  const path = withQuery("/events", { page, deleted: deleted ? "true" : undefined });
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }
  return parseResponse(response, eventPageSchema);
}
