"use client";

import { useEffect } from "react";

import { rememberFocusOutsideDialogs } from "./dialog-opener";

// Mounted once in the root layout: a dialog's own code loads with its route, after the click
// that opened it, so it cannot start listening itself.
export function DialogOpenerTracker() {
  useEffect(() => {
    document.addEventListener("focusin", rememberFocusOutsideDialogs, true);
    return () => document.removeEventListener("focusin", rememberFocusOutsideDialogs, true);
  }, []);
  return null;
}
