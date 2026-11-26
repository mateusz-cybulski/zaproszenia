"use client";

import { dialogOpener } from "./dialog-opener";

// A dialog opened by a link is a route without a Radix trigger, so Radix has nothing to focus on
// close and focus falls to <body>. The link that opened it is still on the list behind the dialog.
export type ReturnFocus = (event: Event) => void;

function returnFocus(event: Event) {
  const opener = dialogOpener();
  if (opener) {
    event.preventDefault();
    opener.focus();
  }
}

export function useReturnFocus(): ReturnFocus {
  return returnFocus;
}
