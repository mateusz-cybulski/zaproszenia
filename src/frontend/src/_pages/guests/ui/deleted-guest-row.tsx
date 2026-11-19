"use client";

import { type Guest, recipientName } from "@/entities/guest";
import { useAction } from "@/shared/lib/actions";
import { formatAddress } from "@/shared/lib/address";
import { formatDateTime } from "@/shared/lib/dates";
import { PurgeButton } from "@/shared/ui/purge-button";
import { RestoreButton } from "@/shared/ui/restore-button";

import { deleteGuestAction } from "../api/delete-guest-action";
import { restoreGuestAction } from "../api/restore-guest-action";

export function DeletedGuestRow({ guest }: { guest: Guest }) {
  const name = recipientName(guest);
  const restore = useAction(() => restoreGuestAction(guest.id));
  const purge = useAction(() => deleteGuestAction(guest.id, true));
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
          {restore.error ?? purge.error}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <RestoreButton
          name={name}
          pending={restore.pending}
          disabled={purge.pending}
          onRestore={() => restore.run()}
        />
        <PurgeButton
          name={name}
          pending={purge.pending}
          disabled={restore.pending}
          onPurge={() => purge.run()}
        />
      </div>
    </li>
  );
}
