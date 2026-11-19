"use client";

import { LoaderCircle, X } from "lucide-react";

import {
  type EventGuest,
  type EventId,
  INVITATION_STATUS_LABELS,
  INVITATION_STATUSES,
  type InvitationStatus,
} from "@/entities/event";
import { recipientName, VerificationBadge } from "@/entities/guest";
import { useAction } from "@/shared/lib/action-call";
import { Button } from "@/shared/ui/button";
import { NativeSelect } from "@/shared/ui/native-select";
import { TableCell, TableRow } from "@/shared/ui/table";

import { removeEventGuestAction } from "../api/remove-event-guest-action";
import { setEventGuestStatusAction } from "../api/set-event-guest-status-action";
import { EVENT_GUESTS_COPY } from "../config/messages";

type EventGuestRowProps = { eventId: EventId; eventGuest: EventGuest };

export function EventGuestRow({ eventId, eventGuest }: EventGuestRowProps) {
  const { guest } = eventGuest;
  const name = recipientName(guest);
  const changeStatus = useAction((status: InvitationStatus) =>
    setEventGuestStatusAction(eventId, guest.id, status),
  );
  const remove = useAction(() => removeEventGuestAction(eventId, guest.id));
  const error = changeStatus.error ?? remove.error;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {name}
        {guest.fullName && guest.institution && (
          <span className="block text-xs font-normal text-muted-foreground">
            {guest.institution}
          </span>
        )}
        {error && (
          <span role="alert" className="block text-xs font-normal text-destructive">
            {error}
          </span>
        )}
      </TableCell>
      <TableCell>
        <VerificationBadge status={guest.verificationStatus} />
      </TableCell>
      <TableCell>
        <NativeSelect
          aria-label={`${EVENT_GUESTS_COPY.status}: ${name}`}
          value={eventGuest.status}
          disabled={changeStatus.pending}
          onChange={(event) => changeStatus.run(event.target.value as InvitationStatus)}
          className="w-40"
        >
          {INVITATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {INVITATION_STATUS_LABELS[status]}
            </option>
          ))}
        </NativeSelect>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={EVENT_GUESTS_COPY.remove(name)}
          onClick={() => remove.run()}
          disabled={remove.pending}
        >
          {remove.pending ? <LoaderCircle className="animate-spin" /> : <X />}
        </Button>
      </TableCell>
    </TableRow>
  );
}
