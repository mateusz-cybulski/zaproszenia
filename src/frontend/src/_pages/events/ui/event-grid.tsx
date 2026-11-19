import { type Event, EventCard } from "@/entities/event";

import { DeleteEventDialog } from "./delete-event-dialog";

type EventGridProps = { events: Event[]; now: number };

export function EventGrid({ events, now }: EventGridProps) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
      {events.map((event) => (
        <li key={event.id} className="grid">
          <EventCard
            event={event}
            past={new Date(event.startsAt).getTime() < now}
            actions={<DeleteEventDialog event={event} />}
          />
        </li>
      ))}
    </ul>
  );
}
