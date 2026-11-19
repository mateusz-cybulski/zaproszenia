import { notFound } from "next/navigation";

import { parseEventId } from "@/entities/event";
import { getEvent, getEventGuests } from "@/entities/event/index.server";
import { getGuests } from "@/entities/guest/index.server";
import { getTemplates } from "@/entities/template/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";

import type { EventSection } from "../model/event-section";
import { EventDialog } from "./event-dialog";

type EventEditDialogProps = { id: string; section: EventSection; dismissal: Dismissal };

export async function EventEditDialog({ id, section, dismissal }: EventEditDialogProps) {
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
  const [templates, eventGuests, guests] = await Promise.all([
    getTemplates(),
    getEventGuests(event.id),
    getGuests(),
  ]);
  return (
    <EventDialog
      event={event}
      templates={templates}
      eventGuests={eventGuests}
      guests={guests}
      initialSection={section}
      dismissal={dismissal}
    />
  );
}
