import { notFound } from "next/navigation";

import { getGuest } from "@/entities/guest/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import { parseRecordId } from "@/shared/lib/actions";
import type { Dismissal } from "@/shared/lib/dialogs";

import { GuestDialog } from "./guest-dialog";
import { VerificationMenu } from "./verification-menu";

type GuestEditDialogProps = { id: string; dismissal: Dismissal };

export async function GuestEditDialog({ id, dismissal }: GuestEditDialogProps) {
  await requireViewer();
  const guestId = parseRecordId(id);
  const guest = guestId === null ? null : await getGuest(guestId);
  if (!guest) {
    notFound();
  }
  return (
    <GuestDialog
      guest={guest}
      dismissal={dismissal}
      headerActions={<VerificationMenu guest={guest} />}
    />
  );
}
