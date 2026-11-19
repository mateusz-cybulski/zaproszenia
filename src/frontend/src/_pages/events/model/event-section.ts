export const EVENT_SECTIONS = ["details", "templates", "guests"] as const;

export type EventSection = (typeof EVENT_SECTIONS)[number];

export function parseEventSection(value: string | string[] | undefined): EventSection {
  return EVENT_SECTIONS.find((section) => section === value) ?? "details";
}
