"use client";

import { useState } from "react";

// A dialog opened by a link is a route without a Radix trigger, so Radix has nothing to focus on
// close and focus falls to <body>. The link that opened it is still on the list behind the dialog.
export type ReturnFocus = (event: Event) => void;

export function useReturnFocus(): ReturnFocus {
  const [opener] = useState(() =>
    typeof document === "undefined" ? null : document.activeElement,
  );
  return (event) => {
    if (opener instanceof HTMLElement && opener !== document.body && opener.isConnected) {
      event.preventDefault();
      opener.focus();
    }
  };
}
