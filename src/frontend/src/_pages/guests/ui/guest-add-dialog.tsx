import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";
import { GuestDialog } from "./guest-dialog";

export async function GuestAddDialog({ dismissal }: { dismissal: Dismissal }) {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  return <GuestDialog dismissal={dismissal} />;
}
