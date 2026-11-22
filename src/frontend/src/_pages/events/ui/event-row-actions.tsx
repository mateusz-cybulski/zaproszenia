import Link from "next/link";

import type { Event } from "@/entities/event";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";

import { DeleteEventDialog } from "./delete-event-dialog";

export function EventRowActions({ event }: { event: Event }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="outline" size="sm">
        <Link href={routes.event(event.id)} scroll={false}>
          Otwórz<span className="sr-only"> {event.name}</span>
        </Link>
      </Button>
      <DeleteEventDialog event={event} />
    </div>
  );
}
