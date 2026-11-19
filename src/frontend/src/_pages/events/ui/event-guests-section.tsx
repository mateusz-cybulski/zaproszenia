"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";

import type { Event, EventGuest } from "@/entities/event";
import type { Page } from "@/shared/api";
import { routes, withQuery } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Pagination } from "@/shared/ui/pagination";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { EVENT_GUESTS_COPY } from "../config/messages";
import { AddGuestsPicker } from "./add-guests-picker";
import { EventGuestRow } from "./event-guest-row";

type EventGuestsSectionProps = { event: Event; eventGuests: Page<EventGuest> };

export function EventGuestsSection({ event, eventGuests }: EventGuestsSectionProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <p className="flex-1 text-sm text-muted-foreground">
          {EVENT_GUESTS_COPY.count(eventGuests.total)}
        </p>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <UserPlus /> {EVENT_GUESTS_COPY.add}
          </Button>
        )}
      </div>
      {adding && <AddGuestsPicker eventId={event.id} onDone={() => setAdding(false)} />}
      {eventGuests.items.length === 0 ? (
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
              {eventGuests.items.map((eventGuest) => (
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
      <Pagination
        page={eventGuests.page}
        pageSize={eventGuests.pageSize}
        total={eventGuests.total}
        hrefForPage={(page) =>
          withQuery(routes.event(event.id), {
            section: "guests",
            guests_page: page > 1 ? page : undefined,
          })
        }
      />
    </div>
  );
}
