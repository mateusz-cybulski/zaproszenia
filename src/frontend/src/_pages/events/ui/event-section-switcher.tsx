"use client";

import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { EVENT_SECTION_COPY } from "../config/messages";
import { EVENT_SECTIONS, type EventSection } from "../model/event-section";

type EventSectionSwitcherProps = {
  section: EventSection;
  onChange: (section: EventSection) => void;
};

export function EventSectionSwitcher({ section, onChange }: EventSectionSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      aria-label={EVENT_SECTION_COPY.label}
      value={section}
      onValueChange={(value) => {
        const next = EVENT_SECTIONS.find((option) => option === value);
        if (next) {
          onChange(next);
        }
      }}
    >
      {EVENT_SECTIONS.map((option) => (
        <ToggleGroupItem key={option} value={option}>
          {EVENT_SECTION_COPY[option]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
