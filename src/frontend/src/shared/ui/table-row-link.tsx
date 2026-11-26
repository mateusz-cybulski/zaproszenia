import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/css";

// A whole table row opens its record: one real link (keyboard, screen readers) whose click area
// covers the row. The row itself never becomes a link: it holds other controls.
export const ROW_WITH_LINK =
  "relative has-[[data-row-link]:focus-visible]:outline-2 has-[[data-row-link]:focus-visible]:-outline-offset-2 has-[[data-row-link]:focus-visible]:outline-ring";

// For cells with their own controls, which stay clickable above the link.
export const ABOVE_ROW_LINK = "relative z-10";

export function TableRowLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      scroll={false}
      data-row-link
      className={cn("outline-none after:absolute after:inset-0", className)}
      {...props}
    />
  );
}
