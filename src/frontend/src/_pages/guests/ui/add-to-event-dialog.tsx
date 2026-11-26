"use client";

import { CalendarPlus } from "lucide-react";
import { useId, useState } from "react";

import type { EventId, EventListItem } from "@/entities/event";
import type { GuestId } from "@/entities/guest";
import { useAction } from "@/shared/lib/action-call";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { NativeSelect } from "@/shared/ui/native-select";

import { addGuestsToEventAction } from "../api/add-guests-to-event-action";
import { SELECTION_COPY as COPY } from "../config/selection-copy";

type AddToEventDialogProps = {
  ids: GuestId[];
  events: EventListItem[];
  disabled: boolean;
  onAdded: (eventName: string) => void;
};

export function AddToEventDialog({ ids, events, disabled, onAdded }: AddToEventDialogProps) {
  const selectId = useId();
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState<EventId | null>(events[0]?.id ?? null);
  const chosen = events.find((event) => event.id === eventId);
  const { run, pending, error, setError } = useAction(addGuestsToEventAction, {
    onSuccess: () => {
      changeOpen(false);
      if (chosen) {
        onAdded(chosen.name);
      }
    },
  });

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" icon={<CalendarPlus />} aria-disabled={disabled}>
          {COPY.addTrigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{COPY.addTitle}</DialogTitle>
          <DialogDescription>{COPY.addDescription(ids.length)}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">{COPY.noEvents}</p>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor={selectId}>{COPY.eventLabel}</Label>
              <NativeSelect
                id={selectId}
                value={eventId ?? ""}
                onChange={(event) =>
                  setEventId(
                    events.find((item) => String(item.id) === event.target.value)?.id ?? null,
                  )
                }
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
          )}
          <p role="alert" className="text-sm text-destructive empty:hidden">
            {error}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => changeOpen(false)}>
              {COPY.cancel}
            </Button>
            {events.length > 0 && (
              <Button
                pending={pending}
                aria-disabled={eventId === null}
                onClick={() => eventId !== null && run(eventId, ids)}
              >
                {pending ? COPY.adding : COPY.add}
              </Button>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
