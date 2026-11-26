"use client";

import { createContext, type ReactNode, use, useState } from "react";

import type { GuestId } from "@/entities/guest";

type GuestSelection = {
  selected: ReadonlySet<GuestId>;
  select: (ids: GuestId[], selected: boolean) => void;
  clear: () => void;
};

const GuestSelectionContext = createContext<GuestSelection | null>(null);

// Kept above the list, so the selection survives paging and searching.
export function GuestSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<ReadonlySet<GuestId>>(new Set());

  function select(ids: GuestId[], isSelected: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (isSelected) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }

  return (
    <GuestSelectionContext value={{ selected, select, clear: () => setSelected(new Set()) }}>
      {children}
    </GuestSelectionContext>
  );
}

export function useGuestSelection(): GuestSelection {
  const selection = use(GuestSelectionContext);
  if (!selection) {
    throw new Error("useGuestSelection needs a GuestSelectionProvider above it");
  }
  return selection;
}
