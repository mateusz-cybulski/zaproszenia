import Link from "next/link";

import type { EventReadiness } from "@/entities/event";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";

import { READINESS_COPY as COPY } from "../config/readiness-copy";
import type { EventSection } from "../model/event-section";

type Warning = {
  text: string;
  action: { label: string } & ({ section: EventSection } | { href: string });
};

function warnings(readiness: EventReadiness): Warning[] {
  const list: Warning[] = [];
  if (readiness.guests === 0) {
    list.push({ text: COPY.noGuests, action: { label: COPY.addGuests, section: "guests" } });
  }
  if (!readiness.invitationTemplate) {
    list.push({
      text: COPY.noInvitationTemplate,
      action: { label: COPY.chooseTemplate, section: "templates" },
    });
  }
  if (!readiness.envelopeTemplate) {
    list.push({
      text: COPY.noEnvelopeTemplate,
      action: { label: COPY.chooseTemplate, section: "templates" },
    });
  }
  if (readiness.unverified > 0) {
    list.push({
      text: COPY.unverified(readiness.unverified),
      action: { label: COPY.openGuests, href: routes.guests() },
    });
  }
  if (readiness.withoutAddress > 0) {
    list.push({
      text: COPY.withoutAddress(readiness.withoutAddress),
      action: { label: COPY.openGuests, href: routes.guests() },
    });
  }
  if (!readiness.senderComplete) {
    list.push({
      text: COPY.senderIncomplete,
      action: { label: COPY.openSettings, href: routes.settings() },
    });
  }
  return list;
}

type EventReadinessNoticeProps = {
  readiness: EventReadiness;
  onSection: (section: EventSection) => void;
};

// What still stands between the event and printing, each with the way to fix it; nothing when ready.
export function EventReadinessNotice({ readiness, onSection }: EventReadinessNoticeProps) {
  const list = warnings(readiness);
  if (list.length === 0) {
    return null;
  }
  return (
    <section
      aria-labelledby="event-readiness-title"
      className="mb-6 grid gap-2 rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm"
    >
      <h3 id="event-readiness-title" className="font-medium">
        {COPY.title}
      </h3>
      <ul className="grid gap-1.5">
        {list.map((warning) => (
          <li
            key={warning.text}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
          >
            <span>{warning.text}</span>
            {"section" in warning.action ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => "section" in warning.action && onSection(warning.action.section)}
              >
                {warning.action.label}
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={warning.action.href}>{warning.action.label}</Link>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
