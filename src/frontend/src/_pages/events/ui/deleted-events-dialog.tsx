"use client";

import type { Event } from "@/entities/event";
import type { Page } from "@/shared/api";
import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes, withQuery } from "@/shared/routes";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { ListPagination } from "@/shared/ui/list-pagination";

import { DeletedEventRow } from "./deleted-event-row";

type DeletedEventsDialogProps = { events: Page<Event>; dismissal: Dismissal };

export function DeletedEventsDialog({ events, dismissal }: DeletedEventsDialogProps) {
  const dismiss = useDismiss(dismissal, routes.events());

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Usunięte wydarzenia</DialogTitle>
          <DialogDescription>
            Przywrócone wydarzenie wraca z listą gości. Usunięcia na stałe nie da się cofnąć.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {events.items.length > 0 ? (
            <ul className="divide-y">
              {events.items.map((event) => (
                <DeletedEventRow key={event.id} event={event} />
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nie ma usuniętych wydarzeń.
            </p>
          )}
          <ListPagination
            page={events.page}
            pageSize={events.pageSize}
            total={events.total}
            hrefForPage={(page) =>
              withQuery(routes.eventsDeleted(), { deleted_page: page > 1 ? page : undefined })
            }
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
