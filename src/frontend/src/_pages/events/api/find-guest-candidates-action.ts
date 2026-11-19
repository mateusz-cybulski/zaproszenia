"use server";

import { unstable_rethrow } from "next/navigation";

import { type EventId, isEventId } from "@/entities/event";
import type { Guest } from "@/entities/guest";
import { getGuests } from "@/entities/guest/index.server";
import type { Page } from "@/shared/api";
import { SEARCH_MAX_LENGTH } from "@/shared/config";

import { EVENT_GUESTS_COPY } from "../config/messages";

type CandidatesResult = { page: Page<Guest> } | { error: string };

// Guests not on the event's list yet, searched on the server one page at a time.
export async function findGuestCandidatesAction(
  eventId: EventId,
  search: string,
  page: number,
): Promise<CandidatesResult> {
  const valid =
    isEventId(eventId) &&
    typeof search === "string" &&
    search.length <= SEARCH_MAX_LENGTH &&
    Number.isSafeInteger(page) &&
    page > 0;
  if (!valid) {
    return { error: EVENT_GUESTS_COPY.searchFailed };
  }
  try {
    return { page: await getGuests({ notOnEvent: eventId, search: search.trim(), page }) };
  } catch (error) {
    unstable_rethrow(error);
    return { error: EVENT_GUESTS_COPY.searchFailed };
  }
}
