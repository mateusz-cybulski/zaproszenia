"use client";

import { useRef, useState } from "react";

export type EventDialogForm = "details" | "templates";

type Batch = { forms: Set<EventDialogForm>; then: () => void };

// Saves several forms of one dialog together and runs `then` once every one of them saved:
// "Zapisz" closes the dialog, "Zapisz i generuj" generates the document. A ref, not state:
// both forms can report success in the same render, and each must see the other's report.
export function useSaveForms() {
  const batch = useRef<Batch | null>(null);
  const [saving, setSaving] = useState(false);

  function start(forms: EventDialogForm[], then: () => void) {
    batch.current = { forms: new Set(forms), then };
    setSaving(true);
  }

  // True when the save belonged to a batch, so the caller does not act on it alone.
  function saved(form: EventDialogForm): boolean {
    const current = batch.current;
    if (!current) {
      return false;
    }
    current.forms.delete(form);
    if (current.forms.size === 0) {
      batch.current = null;
      setSaving(false);
      current.then();
    }
    return true;
  }

  function cancel() {
    batch.current = null;
    setSaving(false);
  }

  return { saving, start, saved, cancel };
}
