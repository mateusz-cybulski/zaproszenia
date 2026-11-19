import { notFound } from "next/navigation";

import { parseEventId } from "@/entities/event";
import { getEvent } from "@/entities/event/index.server";
import { getTemplates } from "@/entities/template/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";

import type { EventSection } from "../model/event-section";
import { EventDialog } from "./event-dialog";

type EventEditDialogProps = { id: string; section: EventSection; dismissal: Dismissal };

export async function EventEditDialog({ id, section, dismissal }: EventEditDialogProps) {
  await requireViewer();
  const eventId = parseEventId(id);
  const [event, templates] = await Promise.all([
    eventId === null ? null : getEvent(eventId),
    getTemplates(),
  ]);
  if (!event) {
    notFound();
  }
  return (
    <EventDialog
      event={event}
      templates={templates}
      initialSection={section}
      dismissal={dismissal}
    />
  );
}
