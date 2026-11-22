"use client";

import { useState } from "react";

import type { EventDocumentKind } from "@/entities/event";

export type EventDialogForm = "details" | "templates";

type Waiting = { kind: EventDocumentKind; forms: ReadonlySet<EventDialogForm> };

// "Zapisz i generuj": the document is generated once every submitted form has saved.
export function useSaveThenGenerate(generate: (kind: EventDocumentKind) => void) {
  const [waiting, setWaiting] = useState<Waiting | null>(null);

  function start(kind: EventDocumentKind, forms: EventDialogForm[]) {
    setWaiting({ kind, forms: new Set(forms) });
  }

  // True when the save belonged to "Zapisz i generuj", so the caller does not close the dialog.
  function saved(form: EventDialogForm): boolean {
    if (!waiting) {
      return false;
    }
    const left = new Set(waiting.forms);
    left.delete(form);
    if (left.size === 0) {
      setWaiting(null);
      generate(waiting.kind);
    } else {
      setWaiting({ kind: waiting.kind, forms: left });
    }
    return true;
  }

  return { waiting: waiting !== null, start, saved, cancel: () => setWaiting(null) };
}
