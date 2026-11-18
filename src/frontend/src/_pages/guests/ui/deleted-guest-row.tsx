"use client";

import { useState } from "react";

import { formatAddress, type Guest, recipientName } from "@/entities/guest";
import { formatDateTime } from "@/shared/lib/dates";

import { PurgeGuestButton } from "./purge-guest-button";
import { RestoreGuestButton } from "./restore-guest-button";

export function DeletedGuestRow({ guest }: { guest: Guest }) {
  const name = recipientName(guest);
  const [error, setError] = useState<string | null>(null);
  const details = [
    guest.deletedAt && `Usunięto ${formatDateTime(guest.deletedAt)}`,
    guest.fullName && guest.institution,
    formatAddress(guest),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-sm text-muted-foreground">{details}</p>
        <p role="alert" className="text-sm text-destructive empty:hidden">
          {error}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <RestoreGuestButton guestId={guest.id} name={name} onError={setError} />
        <PurgeGuestButton guestId={guest.id} name={name} onError={setError} />
      </div>
    </li>
  );
}
