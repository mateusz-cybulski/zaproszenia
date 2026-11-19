import { getEvents } from "@/entities/event/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";
import { parsePage } from "@/shared/lib/pagination";
import type { SearchParams } from "@/shared/routes";

import { DeletedEventsDialog } from "./deleted-events-dialog";
import { EventsPage } from "./events-page";

type DeletedEventsProps = { dismissal: Dismissal; searchParams: SearchParams };

// Its own page parameter, so the list behind the dialog keeps its page.
async function DeletedEvents({ dismissal, searchParams }: DeletedEventsProps) {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  const { deleted_page: deletedPage } = await searchParams;
  const events = await getEvents({ deleted: true, page: parsePage(deletedPage) });
  return <DeletedEventsDialog events={events} dismissal={dismissal} />;
}

export function DeletedEventsModal({ searchParams }: { searchParams: SearchParams }) {
  return <DeletedEvents dismissal="back" searchParams={searchParams} />;
}

export function EventsDeletedPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <EventsPage searchParams={searchParams} />
      <DeletedEvents dismissal="to-list" searchParams={searchParams} />
    </>
  );
}
