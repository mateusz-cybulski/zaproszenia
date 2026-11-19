import { notFound } from "next/navigation";

import { parseEventId } from "@/entities/event";
import { getEvent } from "@/entities/event/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";

import { EventDialog } from "./event-dialog";

type EventEditDialogProps = { id: string; dismissal: Dismissal };

export async function EventEditDialog({ id, dismissal }: EventEditDialogProps) {
  await requireViewer();
  const eventId = parseEventId(id);
  const event = eventId === null ? null : await getEvent(eventId);
  if (!event) {
    notFound();
  }
  return <EventDialog event={event} dismissal={dismissal} />;
}
