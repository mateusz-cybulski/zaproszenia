import { notFound } from "next/navigation";

import { parseEventId } from "@/entities/event";
import { getEvent, getEventGuests, getEventReadiness } from "@/entities/event/index.server";
import { getTemplates } from "@/entities/template/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";

import type { EventSection } from "../model/event-section";
import { EventDialog } from "./event-dialog";

type EventEditDialogProps = {
  id: string;
  section: EventSection;
  guestsPage: number;
  dismissal: Dismissal;
};

export async function EventEditDialog({
  id,
  section,
  guestsPage,
  dismissal,
}: EventEditDialogProps) {
  await requireViewer();
  const eventId = parseEventId(id);
  if (eventId === null) {
    notFound();
  }
  const event = await getEvent(eventId);
  if (!event) {
    notFound();
  }
  // Only for an event that exists: its guest list would answer 404 otherwise.
  const [templates, eventGuests, readiness] = await Promise.all([
    getTemplates(),
    getEventGuests(event.id, { page: guestsPage }),
    getEventReadiness(event.id),
  ]);
  return (
    <EventDialog
      event={event}
      templates={templates}
      eventGuests={eventGuests}
      readiness={readiness}
      initialSection={section}
      dismissal={dismissal}
    />
  );
}
