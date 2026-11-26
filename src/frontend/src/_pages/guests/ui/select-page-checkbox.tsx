"use client";

import { useState } from "react";

import type { GuestId } from "@/entities/guest";
import { Checkbox } from "@/shared/ui/checkbox";

import { SELECTION_COPY as COPY } from "../config/selection-copy";
import { useGuestSelection } from "../model/guest-selection-context";

// Shows only its own choice: selecting single rows does not tick or half-tick it.
export function SelectPageCheckbox({ ids }: { ids: GuestId[] }) {
  const { selected, select } = useGuestSelection();
  const [pageSelected, setPageSelected] = useState(false);
  // Cleared together with the selection, e.g. after the selected guests were deleted.
  const checked = pageSelected && selected.size > 0;
  return (
    <Checkbox
      aria-label={COPY.selectPage}
      checked={checked}
      onCheckedChange={() => {
        select(ids, !checked);
        setPageSelected(!checked);
      }}
    />
  );
}
