import { DialogSkeleton } from "@/shared/ui/dialog-skeleton";
import { Page } from "@/shared/ui/page";
import { TableSkeleton } from "@/shared/ui/table-skeleton";

import { GUESTS_PAGE } from "../config/page-copy";

// Shown by Next while the route's server components load (loading.tsx).
export function GuestsLoading() {
  return (
    <Page title={GUESTS_PAGE.title} description={GUESTS_PAGE.description}>
      <TableSkeleton columns={5} />
    </Page>
  );
}

export function GuestModalLoading() {
  return <DialogSkeleton header="title-bar" className="max-w-2xl" />;
}

export function DeletedGuestsModalLoading() {
  return <DialogSkeleton header="header" className="max-w-2xl" />;
}
