import { notFound } from "next/navigation";

import { getGuest } from "@/entities/guest/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";
import { GuestDialog } from "./guest-dialog";
import { VerificationMenu } from "./verification-menu";

import { parseGuestId } from "../model/guest-id";

type GuestEditDialogProps = { id: string; dismissal: Dismissal };

export async function GuestEditDialog({ id, dismissal }: GuestEditDialogProps) {
  await requireViewer();
  const guestId = parseGuestId(id);
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
