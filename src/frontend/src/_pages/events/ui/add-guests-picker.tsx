"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import type { EventId } from "@/entities/event";
import { type Guest, type GuestId, recipientName, VerificationBadge } from "@/entities/guest";
import { useAction } from "@/shared/lib/action-call";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { addEventGuestsAction } from "../api/add-event-guests-action";
import { EVENT_GUESTS_COPY } from "../config/messages";

type AddGuestsPickerProps = { eventId: EventId; candidates: Guest[]; onDone: () => void };

function matches(guest: Guest, query: string): boolean {
  const text = [guest.fullName, guest.institution].filter(Boolean).join(" ").toLowerCase();
  return text.includes(query.toLowerCase());
}

export function AddGuestsPicker({ eventId, candidates, onDone }: AddGuestsPickerProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReadonlySet<GuestId>>(new Set());
  const visible = candidates.filter((guest) => matches(guest, query.trim()));
  const add = useAction(() => addEventGuestsAction(eventId, [...selected]), { onSuccess: onDone });

  function toggle(guestId: GuestId, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(guestId);
      } else {
        next.delete(guestId);
      }
      return next;
    });
  }

  return (
    <div className="grid gap-3 rounded-lg border p-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          aria-label={EVENT_GUESTS_COPY.search}
          placeholder={EVENT_GUESTS_COPY.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-8"
        />
      </div>
      {visible.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {EVENT_GUESTS_COPY.noCandidates}
        </p>
      ) : (
        <ul className="grid max-h-64 divide-y overflow-y-auto rounded-md border">
          <li>
            <label className="flex cursor-pointer items-center gap-3 bg-muted/50 px-3 py-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={visible.every((guest) => selected.has(guest.id))}
                onChange={(event) =>
                  setSelected(
                    event.target.checked ? new Set(visible.map((guest) => guest.id)) : new Set(),
                  )
                }
              />
              {EVENT_GUESTS_COPY.selectAll(visible.length)}
            </label>
          </li>
          {visible.map((guest) => (
            <li key={guest.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={selected.has(guest.id)}
                  onChange={(event) => toggle(guest.id, event.target.checked)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{recipientName(guest)}</span>
                  {guest.fullName && guest.institution && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {guest.institution}
                    </span>
                  )}
                </span>
                <VerificationBadge status={guest.verificationStatus} />
              </label>
            </li>
          ))}
        </ul>
      )}
      <p role="alert" className="text-sm text-destructive empty:hidden">
        {add.error}
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>
          {EVENT_GUESTS_COPY.cancel}
        </Button>
        <Button onClick={() => add.run()} disabled={selected.size === 0 || add.pending}>
          {EVENT_GUESTS_COPY.addSelected(selected.size)}
        </Button>
      </div>
    </div>
  );
}
