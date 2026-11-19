"use client";

import { useState } from "react";

import type { Event } from "@/entities/event";
import type { Template } from "@/entities/template";
import { SegmentedControl } from "@/shared/ui/segmented-control";

import { EVENT_SECTION_COPY } from "../config/messages";
import { EVENT_SECTIONS, type EventSection } from "../model/event-section";
import { EventForm } from "./event-form";
import { TemplateChoiceForm } from "./template-choice-form";

type EventSectionsProps = {
  event: Event;
  templates: Template[];
  initialSection: EventSection;
  onSaved: () => void;
};

const SECTION_OPTIONS = EVENT_SECTIONS.map((section) => ({
  value: section,
  label: EVENT_SECTION_COPY[section],
}));

export function EventSections({ event, templates, initialSection, onSaved }: EventSectionsProps) {
  const [section, setSection] = useState(initialSection);
  // A section stays mounted once opened, so switching back keeps what the user typed.
  const [opened, setOpened] = useState<ReadonlySet<EventSection>>(new Set([initialSection]));

  function changeSection(next: EventSection) {
    setSection(next);
    setOpened((current) => new Set(current).add(next));
    const query = next === "details" ? "" : `?section=${next}`;
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);
  }

  return (
    <>
      <SegmentedControl
        label={EVENT_SECTION_COPY.label}
        name="event-section"
        options={SECTION_OPTIONS}
        value={section}
        onChange={changeSection}
      />
      {opened.has("details") && (
        <div hidden={section !== "details"}>
          <EventForm event={event} onSaved={onSaved} />
        </div>
      )}
      {opened.has("templates") && (
        <div hidden={section !== "templates"}>
          <TemplateChoiceForm event={event} templates={templates} />
        </div>
      )}
      {opened.has("guests") && (
        <p hidden={section !== "guests"} className="text-sm text-muted-foreground">
          {EVENT_SECTION_COPY.guestsSoon}
        </p>
      )}
    </>
  );
}
