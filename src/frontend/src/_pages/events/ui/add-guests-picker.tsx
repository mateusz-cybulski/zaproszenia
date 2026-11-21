"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useState } from "react";

import type { EventId } from "@/entities/event";
import { type GuestId, recipientName, VerificationBadge } from "@/entities/guest";
import { SEARCH_MAX_LENGTH } from "@/shared/config";
import { useAction } from "@/shared/lib/action-call";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";

import { addEventGuestsAction } from "../api/add-event-guests-action";
import { addMatchingEventGuestsAction } from "../api/add-matching-event-guests-action";
import { EVENT_GUESTS_COPY } from "../config/messages";
import { useGuestCandidates } from "../model/use-guest-candidates";

type AddGuestsPickerProps = { eventId: EventId; onDone: () => void };

export function AddGuestsPicker({ eventId, onDone }: AddGuestsPickerProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReadonlySet<GuestId>>(new Set());
  const candidates = useGuestCandidates(eventId, query.trim());
  const add = useAction(() => addEventGuestsAction(eventId, [...selected]), { onSuccess: onDone });
  const addAll = useAction(() => addMatchingEventGuestsAction(eventId, query.trim()), {
    onSuccess: onDone,
  });
  const busy = add.pending || addAll.pending;
  const { guests } = candidates;

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
          maxLength={SEARCH_MAX_LENGTH}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-8"
        />
      </div>
      {guests.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {candidates.loading ? EVENT_GUESTS_COPY.loading : EVENT_GUESTS_COPY.noCandidates}
        </p>
      ) : (
        <ul className="grid max-h-64 divide-y overflow-y-auto rounded-md border">
          <li>
            <label className="flex cursor-pointer items-center gap-3 bg-muted/50 px-3 py-2 text-sm font-medium">
              <Checkbox
                checked={guests.every((guest) => selected.has(guest.id))}
                onCheckedChange={(checked) =>
                  setSelected(
                    checked === true ? new Set(guests.map((guest) => guest.id)) : new Set(),
                  )
                }
              />
              {EVENT_GUESTS_COPY.selectAll(guests.length)}
            </label>
          </li>
          {guests.map((guest) => (
            <li key={guest.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50">
                <Checkbox
                  checked={selected.has(guest.id)}
                  onCheckedChange={(checked) => toggle(guest.id, checked === true)}
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
          {candidates.hasMore && (
            <li className="p-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={candidates.loadMore}
                disabled={candidates.loading}
              >
                {candidates.loading && <LoaderCircle className="animate-spin" />}
                {EVENT_GUESTS_COPY.showMore(guests.length, candidates.total)}
              </Button>
            </li>
          )}
        </ul>
      )}
      <p role="alert" className="text-sm text-destructive empty:hidden">
        {candidates.error ?? add.error ?? addAll.error}
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onDone}>
          {EVENT_GUESTS_COPY.cancel}
        </Button>
        {candidates.total > 0 && (
          <Button variant="outline" onClick={() => addAll.run()} aria-disabled={busy}>
            {EVENT_GUESTS_COPY.addAllMatching(candidates.total)}
          </Button>
        )}
        <Button onClick={() => add.run()} disabled={selected.size === 0} aria-disabled={busy}>
          {EVENT_GUESTS_COPY.addSelected(selected.size)}
        </Button>
      </div>
    </div>
  );
}
