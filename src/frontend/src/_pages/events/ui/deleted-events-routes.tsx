import { getDeletedEvents } from "@/entities/event/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";

import { DeletedEventsDialog } from "./deleted-events-dialog";
import { EventsPage } from "./events-page";

async function DeletedEvents({ dismissal }: { dismissal: Dismissal }) {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  return <DeletedEventsDialog events={await getDeletedEvents()} dismissal={dismissal} />;
}

export function DeletedEventsModal() {
  return <DeletedEvents dismissal="back" />;
}

export function EventsDeletedPage() {
  return (
    <>
      <EventsPage />
      <DeletedEvents dismissal="to-list" />
    </>
  );
}
