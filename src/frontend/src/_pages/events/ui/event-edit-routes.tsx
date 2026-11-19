import type { Dismissal } from "@/shared/lib/dialogs";
import { parsePage } from "@/shared/lib/pagination";
import type { SearchParams } from "@/shared/routes";

import { parseEventSection } from "../model/event-section";
import { EventEditDialog } from "./event-edit-dialog";
import { EventsPage } from "./events-page";

type EventRouteProps = { params: Promise<{ id: string }>; searchParams: SearchParams };

// The guest list has its own page parameter, so the events list behind keeps its page.
async function EventEdit({
  params,
  searchParams,
  dismissal,
}: EventRouteProps & { dismissal: Dismissal }) {
  const [{ id }, { section, guests_page: guestsPage }] = await Promise.all([params, searchParams]);
  return (
    <EventEditDialog
      id={id}
      section={parseEventSection(section)}
      guestsPage={parsePage(guestsPage)}
      dismissal={dismissal}
    />
  );
}

export function EventEditModal(props: EventRouteProps) {
  return <EventEdit {...props} dismissal="back" />;
}

export function EventsEditPage(props: EventRouteProps) {
  return (
    <>
      <EventsPage searchParams={props.searchParams} />
      <EventEdit {...props} dismissal="to-list" />
    </>
  );
}
