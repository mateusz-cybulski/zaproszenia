import type { z } from "zod";

import type { eventGuestDtoSchema } from "../api/event-guest-dto";

export const INVITATION_STATUSES = ["added", "generated", "sent", "accepted", "declined"] as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

// A guest on one event's list, with where their invitation stands.
export type EventGuest = z.output<typeof eventGuestDtoSchema>;
