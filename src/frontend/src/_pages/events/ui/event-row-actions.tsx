import type { Event } from "@/entities/event";

import { DeleteEventDialog } from "./delete-event-dialog";

export function EventRowActions({ event }: { event: Event }) {
  return (
    <div className="flex items-center justify-end">
      <DeleteEventDialog event={event} />
    </div>
  );
}
