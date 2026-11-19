import { CalendarDays, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { formatLongDateTime } from "@/shared/lib/dates";
import { Badge } from "@/shared/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";

import { type Event, formatVenue } from "../model/event";

type EventCardProps = { event: Event; past: boolean; actions?: ReactNode };

export function EventCard({ event, past, actions }: EventCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="min-w-0 break-words">{event.name}</span>
          {past && <Badge variant="secondary">Zakończone</Badge>}
        </CardTitle>
        <CardDescription className="grid gap-1">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            {formatLongDateTime(event.startsAt, event.timeZone)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {formatVenue(event) || "Miejsce nieustalone"}
          </span>
        </CardDescription>
      </CardHeader>
      {actions && <CardFooter className="flex flex-wrap gap-2 border-t">{actions}</CardFooter>}
    </Card>
  );
}
