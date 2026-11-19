"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";

import type { Event, EventGuest } from "@/entities/event";
import type { Guest } from "@/entities/guest";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { EVENT_GUESTS_COPY } from "../config/messages";
import { AddGuestsPicker } from "./add-guests-picker";
import { EventGuestRow } from "./event-guest-row";

type EventGuestsSectionProps = { event: Event; eventGuests: EventGuest[]; guests: Guest[] };

export function EventGuestsSection({ event, eventGuests, guests }: EventGuestsSectionProps) {
  const [adding, setAdding] = useState(false);
  const onList = new Set(eventGuests.map((eventGuest) => eventGuest.guest.id));
  const candidates = guests.filter((guest) => !onList.has(guest.id));

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <p className="flex-1 text-sm text-muted-foreground">
          {EVENT_GUESTS_COPY.count(eventGuests.length)}
        </p>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <UserPlus /> {EVENT_GUESTS_COPY.add}
          </Button>
        )}
      </div>
      {adding && (
        <AddGuestsPicker
          eventId={event.id}
          candidates={candidates}
          onDone={() => setAdding(false)}
        />
      )}
      {eventGuests.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{EVENT_GUESTS_COPY.empty}</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gość</TableHead>
                <TableHead>Weryfikacja</TableHead>
                <TableHead>{EVENT_GUESTS_COPY.status}</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Akcje</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventGuests.map((eventGuest) => (
                <EventGuestRow
                  key={eventGuest.guest.id}
                  eventId={event.id}
                  eventGuest={eventGuest}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
