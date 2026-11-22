"use client";

import { useEffect } from "react";

// Reloading or closing the tab; closing the dialog asks in the app's own dialog.
export function useUnsavedChangesWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) {
      return;
    }
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}
