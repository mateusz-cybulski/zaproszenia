import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";

import { EventDialog } from "./event-dialog";
import { EventsPage } from "./events-page";

async function EventAdd({ dismissal }: { dismissal: Dismissal }) {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  return <EventDialog dismissal={dismissal} />;
}

export function EventAddModal() {
  return <EventAdd dismissal="back" />;
}

export function EventsAddPage() {
  return (
    <>
      <EventsPage />
      <EventAdd dismissal="to-list" />
    </>
  );
}
