"use client";

import { SegmentedControl } from "@/shared/ui/segmented-control";

import { EVENT_SECTION_COPY } from "../config/messages";
import { EVENT_SECTIONS, type EventSection } from "../model/event-section";

const SECTION_OPTIONS = EVENT_SECTIONS.map((section) => ({
  value: section,
  label: EVENT_SECTION_COPY[section],
}));

type EventSectionSwitcherProps = {
  section: EventSection;
  onChange: (section: EventSection) => void;
};

export function EventSectionSwitcher({ section, onChange }: EventSectionSwitcherProps) {
  return (
    <SegmentedControl
      label={EVENT_SECTION_COPY.label}
      name="event-section"
      options={SECTION_OPTIONS}
      value={section}
      onChange={onChange}
    />
  );
}
