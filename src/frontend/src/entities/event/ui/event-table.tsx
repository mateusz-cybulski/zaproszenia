import type { ReactNode } from "react";

import { cn } from "@/shared/lib/css";
import { formatLongDateTime } from "@/shared/lib/dates";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ABOVE_ROW_LINK, ROW_WITH_LINK, TableRowLink } from "@/shared/ui/table-row-link";

import { type Event, type EventListItem, formatVenue } from "../model/event";

type EventTableProps = {
  events: EventListItem[];
  // The request time, so a finished event is marked the same way on the server and in the browser.
  now: number;
  emptyMessage: string;
  // Opens the event: the name is the link and its click area covers the whole row.
  hrefFor?: (event: Event) => string;
  renderActions?: (event: Event) => ReactNode;
};

export function EventTable({ events, now, emptyMessage, hrefFor, renderActions }: EventTableProps) {
  if (events.length === 0) {
    return <p className="p-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Wydarzenie</TableHead>
          <TableHead>Termin</TableHead>
          <TableHead>Miejsce</TableHead>
          <TableHead className="text-right">Goście</TableHead>
          {renderActions && (
            <TableHead className="text-right">
              <span className="sr-only">Akcje</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id} className={cn(hrefFor && ROW_WITH_LINK)}>
            <TableCell className="font-medium">
              <span className="flex items-center gap-2">
                {hrefFor ? (
                  <TableRowLink href={hrefFor(event)}>{event.name}</TableRowLink>
                ) : (
                  event.name
                )}
                {new Date(event.startsAt).getTime() < now && (
                  <Badge variant="secondary">Zakończone</Badge>
                )}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatLongDateTime(event.startsAt, event.timeZone)}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatVenue(event) || "—"}</TableCell>
            <TableCell className="text-right text-muted-foreground tabular-nums">
              {event.guestCount}
            </TableCell>
            {renderActions && (
              <TableCell className={cn("text-right", ABOVE_ROW_LINK)}>
                {renderActions(event)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
