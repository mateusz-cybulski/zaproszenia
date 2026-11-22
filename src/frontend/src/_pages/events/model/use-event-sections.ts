"use client";

import { useRef, useState } from "react";

import type { EventSection } from "./event-section";

export function useEventSections(initialSection: EventSection) {
  const [section, setSection] = useState(initialSection);
  // Guests and the template previews load once their section is first opened, then stay.
  const [opened, setOpened] = useState<ReadonlySet<EventSection>>(
    new Set(["details", initialSection]),
  );
  const bodyRef = useRef<HTMLDivElement>(null);

  function changeSection(next: EventSection) {
    setSection(next);
    setOpened((current) => new Set(current).add(next));
    bodyRef.current?.scrollTo({ top: 0 });
    const query = next === "details" ? "" : `?section=${next}`;
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);
  }

  return { section, opened, bodyRef, changeSection };
}

export type EventSectionsState = ReturnType<typeof useEventSections>;
