import type { Alignment, FontName } from "../model/template-field";

export const FONT_LABELS: Record<FontName, string> = {
  serif: "Szeryfowa",
  "serif-bold": "Szeryfowa pogrubiona",
  "serif-italic": "Szeryfowa kursywa",
  sans: "Bezszeryfowa",
  "sans-bold": "Bezszeryfowa pogrubiona",
};

export const ALIGNMENT_LABELS: Record<Alignment, string> = {
  left: "Do lewej",
  center: "Do środka",
  right: "Do prawej",
};

// The groups the API gives placeholders, in the order the editor lists them.
export const PLACEHOLDER_GROUPS = ["Gość", "Wydarzenie", "Nadawca"] as const;
