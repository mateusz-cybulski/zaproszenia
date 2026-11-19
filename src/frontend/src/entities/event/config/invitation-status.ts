import type { InvitationStatus } from "../model/event-guest";

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  added: "Dodany",
  generated: "Wygenerowane",
  sent: "Wysłane",
  accepted: "Przyjęte",
  declined: "Odrzucone",
};
