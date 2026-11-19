import { getDeletedGuests } from "@/entities/guest/index.server";
import { requireViewer } from "@/entities/viewer/index.server";

import type { Dismissal } from "@/shared/lib/dialogs";
import { DeletedGuestsDialog } from "./deleted-guests-dialog";
import { GuestsPage, type GuestsPageProps } from "./guests-page";

async function DeletedGuests({ dismissal }: { dismissal: Dismissal }) {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  return <DeletedGuestsDialog guests={await getDeletedGuests()} dismissal={dismissal} />;
}

export function DeletedGuestsModal() {
  return <DeletedGuests dismissal="back" />;
}

export function GuestsDeletedPage({ searchParams }: GuestsPageProps) {
  return (
    <>
      <GuestsPage searchParams={searchParams} />
      <DeletedGuests dismissal="to-list" />
    </>
  );
}
