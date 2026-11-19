import "server-only";

import { type Page, pageSchema } from "@/shared/api";
import { apiFetch, parseResponse } from "@/shared/api/index.server";
import { withQuery } from "@/shared/routes";

import type { Guest } from "../model/guest";
import { guestDtoSchema } from "./guest-dto";

type GuestQuery = { search?: string; page?: number; deleted?: boolean; notOnEvent?: number };

const guestPageSchema = pageSchema(guestDtoSchema);

export async function getGuests({ search, page, deleted, notOnEvent }: GuestQuery = {}): Promise<
  Page<Guest>
> {
  const path = withQuery("/guests", {
    q: search,
    page,
    deleted: deleted ? "true" : undefined,
    not_on_event: notOnEvent,
  });
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }
  return parseResponse(response, guestPageSchema);
}
