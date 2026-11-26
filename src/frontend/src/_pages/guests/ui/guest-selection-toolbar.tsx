"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import type { EventListItem } from "@/entities/event";
import { Button } from "@/shared/ui/button";
import { ConfirmActionDialog } from "@/shared/ui/confirm-action-dialog";

import { deleteGuestsAction } from "../api/delete-guests-action";
import { SELECTION_COPY as COPY } from "../config/selection-copy";
import { useGuestSelection } from "../model/guest-selection-context";
import { AddToEventDialog } from "./add-to-event-dialog";
import { VerifyAllDialog } from "./verify-all-dialog";

// Always shown, so the layout does not jump and focus has a place to return to after a dialog.
export function GuestSelectionToolbar({ events }: { events: EventListItem[] }) {
  const { selected, clear } = useGuestSelection();
  const [status, setStatus] = useState<string | null>(null);
  const ids = [...selected];
  const tooMany = ids.length > COPY.maxGuests;
  const disabled = ids.length === 0 || tooMany;

  async function deleteSelected() {
    const result = await deleteGuestsAction(ids);
    if (result.error === undefined) {
      clear();
      setStatus(null);
    }
    return result;
  }

  return (
    <div
      role="toolbar"
      aria-label={COPY.toolbarLabel}
      className="flex min-h-10 flex-wrap items-center gap-2"
    >
      <p className="mr-auto text-sm text-muted-foreground" aria-live="polite">
        {ids.length === 0 ? COPY.hint : COPY.selected(ids.length)}
        {tooMany && <span className="text-destructive"> {COPY.tooMany(COPY.maxGuests)}</span>}
        {status && ids.length > 0 && <span> · {status}</span>}
      </p>
      <VerifyAllDialog ids={ids} disabled={tooMany} />
      <AddToEventDialog
        ids={ids}
        events={events}
        disabled={disabled}
        onAdded={(eventName) => setStatus(COPY.added(eventName))}
      />
      <ConfirmActionDialog
        trigger={
          <Button variant="outline" icon={<Trash2 />} aria-disabled={disabled}>
            {COPY.deleteTrigger}
          </Button>
        }
        title={COPY.deleteTitle}
        description={COPY.deleteDescription(ids.length)}
        confirmLabel={COPY.delete}
        pendingLabel={COPY.deleting}
        tone="destructive"
        action={deleteSelected}
      />
    </div>
  );
}
