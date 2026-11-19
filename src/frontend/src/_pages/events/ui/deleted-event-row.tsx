"use client";

import { useState } from "react";

import { type Event, formatVenue } from "@/entities/event";
import { formatDateTime, formatLongDateTime } from "@/shared/lib/dates";
import { PurgeButton } from "@/shared/ui/purge-button";
import { RestoreButton } from "@/shared/ui/restore-button";

import { deleteEventAction } from "../api/delete-event-action";
import { restoreEventAction } from "../api/restore-event-action";

export function DeletedEventRow({ event }: { event: Event }) {
  const [error, setError] = useState<string | null>(null);
  const details = [
    event.deletedAt && `Usunięto ${formatDateTime(event.deletedAt)}`,
    formatLongDateTime(event.startsAt, event.timeZone),
    formatVenue(event),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{event.name}</p>
        <p className="truncate text-sm text-muted-foreground">{details}</p>
        <p role="alert" className="text-sm text-destructive empty:hidden">
          {error}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <RestoreButton
          name={event.name}
          restore={() => restoreEventAction(event.id)}
          onError={setError}
        />
        <PurgeButton
          name={event.name}
          purge={() => deleteEventAction(event.id, true)}
          onError={setError}
        />
      </div>
    </li>
  );
}
