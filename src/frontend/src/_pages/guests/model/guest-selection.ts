import { type GuestId, isGuestId } from "@/entities/guest";

import { SELECTION_COPY } from "../config/selection-copy";

// Ids from the client are checked again on the server: a Server Action is a public endpoint.
export function isGuestSelection(value: unknown): value is GuestId[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= SELECTION_COPY.maxGuests &&
    value.every(isGuestId)
  );
}
