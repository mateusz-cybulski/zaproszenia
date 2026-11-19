"use client";

import type { Event } from "@/entities/event";
import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { DeletedEventRow } from "./deleted-event-row";

type DeletedEventsDialogProps = { events: Event[]; dismissal: Dismissal };

export function DeletedEventsDialog({ events, dismissal }: DeletedEventsDialogProps) {
  const dismiss = useDismiss(dismissal, routes.events());

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pr-8">
          <DialogTitle>Usunięte wydarzenia</DialogTitle>
          <DialogDescription>
            Przywrócone wydarzenie wraca z listą gości. Usunięcia na stałe nie da się cofnąć.
          </DialogDescription>
        </DialogHeader>
        {events.length > 0 ? (
          <ul className="divide-y">
            {events.map((event) => (
              <DeletedEventRow key={event.id} event={event} />
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nie ma usuniętych wydarzeń.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
