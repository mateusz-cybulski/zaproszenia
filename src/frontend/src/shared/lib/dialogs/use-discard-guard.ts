"use client";

import { useState } from "react";

import { useUnsavedChangesWarning } from "./use-unsaved-changes-warning";

// Closing a dialog (close button, Escape, a click outside) with unsaved changes asks first,
// through DiscardChangesDialog; reloading or closing the tab shows the browser's warning.
export function useDiscardGuard(dirty: boolean, dismiss: () => void) {
  const [confirming, setConfirming] = useState(false);
  useUnsavedChangesWarning(dirty);

  function close() {
    if (dirty) {
      setConfirming(true);
    } else {
      dismiss();
    }
  }

  return {
    close,
    confirming,
    keepEditing: () => setConfirming(false),
    discard: () => {
      setConfirming(false);
      dismiss();
    },
  };
}
