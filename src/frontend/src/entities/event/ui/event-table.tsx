import type { ReactNode } from "react";

import { formatLongDateTime } from "@/shared/lib/dates";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { type Event, formatVenue } from "../model/event";

type EventTableProps = {
  events: Event[];
  // The request time, so a finished event is marked the same way on the server and in the browser.
  now: number;
  emptyMessage: string;
  renderActions?: (event: Event) => ReactNode;
};

export function EventTable({ events, now, emptyMessage, renderActions }: EventTableProps) {
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
          {renderActions && (
            <TableHead className="text-right">
              <span className="sr-only">Akcje</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">
              <span className="flex items-center gap-2">
                {event.name}
                {new Date(event.startsAt).getTime() < now && (
                  <Badge variant="secondary">Zakończone</Badge>
                )}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatLongDateTime(event.startsAt, event.timeZone)}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatVenue(event) || "—"}</TableCell>
            {renderActions && <TableCell className="text-right">{renderActions(event)}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
