"use client";

import type { GuestId } from "@/entities/guest";
import { Checkbox } from "@/shared/ui/checkbox";

import { SELECTION_COPY as COPY } from "../config/selection-copy";
import { useGuestSelection } from "../model/guest-selection-context";

export function GuestSelectCheckbox({ id, name }: { id: GuestId; name: string }) {
  const { selected, select } = useGuestSelection();
  return (
    <Checkbox
      aria-label={COPY.selectGuest(name)}
      checked={selected.has(id)}
      onCheckedChange={(checked) => select([id], checked === true)}
    />
  );
}
