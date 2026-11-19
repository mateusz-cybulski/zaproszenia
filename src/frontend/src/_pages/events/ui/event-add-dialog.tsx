import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";

import { EventDialog } from "./event-dialog";

export async function EventAddDialog({ dismissal }: { dismissal: Dismissal }) {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  return <EventDialog dismissal={dismissal} />;
}
