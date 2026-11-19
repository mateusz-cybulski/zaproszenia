"use client";

import { useState } from "react";

import type { Event, EventGuest } from "@/entities/event";
import type { Template } from "@/entities/template";
import type { Page } from "@/shared/api";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { EVENT_SECTION_COPY } from "../config/messages";
import { EVENT_SECTIONS, type EventSection } from "../model/event-section";
import { EventForm } from "./event-form";
import { EventGuestsSection } from "./event-guests-section";
import { TemplateChoiceForm } from "./template-choice-form";

type EventSectionsProps = {
  event: Event;
  templates: Template[];
  eventGuests: Page<EventGuest>;
  initialSection: EventSection;
  onSaved: () => void;
};

export function EventSections({
  event,
  templates,
  eventGuests,
  initialSection,
  onSaved,
}: EventSectionsProps) {
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
      <ToggleGroup
        type="single"
        variant="outline"
        aria-label={EVENT_SECTION_COPY.label}
        value={section}
        onValueChange={(value) => {
          const next = EVENT_SECTIONS.find((option) => option === value);
          if (next) {
            changeSection(next);
          }
        }}
      >
        {EVENT_SECTIONS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {EVENT_SECTION_COPY[option]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
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
        <div hidden={section !== "guests"}>
          <EventGuestsSection event={event} eventGuests={eventGuests} />
        </div>
      )}
    </>
  );
}
