import { getGuests } from "@/entities/guest/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";
import { parsePage } from "@/shared/lib/pagination";
import type { SearchParams } from "@/shared/routes";

import { DeletedGuestsDialog } from "./deleted-guests-dialog";
import { GuestsPage } from "./guests-page";

type DeletedGuestsProps = { dismissal: Dismissal; searchParams: SearchParams };

// Its own page parameter, so the list behind the dialog keeps its page.
async function DeletedGuests({ dismissal, searchParams }: DeletedGuestsProps) {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  const { deleted_page: deletedPage } = await searchParams;
  const guests = await getGuests({ deleted: true, page: parsePage(deletedPage) });
  return <DeletedGuestsDialog guests={guests} dismissal={dismissal} />;
}

export function DeletedGuestsModal({ searchParams }: { searchParams: SearchParams }) {
  return <DeletedGuests dismissal="back" searchParams={searchParams} />;
}

export function GuestsDeletedPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <GuestsPage searchParams={searchParams} />
      <DeletedGuests dismissal="to-list" searchParams={searchParams} />
    </>
  );
}
