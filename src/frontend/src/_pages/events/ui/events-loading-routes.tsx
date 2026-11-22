import { DialogSkeleton } from "@/shared/ui/dialog-skeleton";
import { Page } from "@/shared/ui/page";
import { TableSkeleton } from "@/shared/ui/table-skeleton";

import { EVENTS_PAGE } from "../config/page-copy";

// Shown by Next while the route's server components load (loading.tsx).
export function EventsLoading() {
  return (
    <Page title={EVENTS_PAGE.title} description={EVENTS_PAGE.description}>
      <TableSkeleton columns={4} />
    </Page>
  );
}

export function EventEditModalLoading() {
  return <DialogSkeleton header="title-bar" className="max-w-4xl" />;
}

export function EventAddModalLoading() {
  return <DialogSkeleton header="title-bar" className="max-w-2xl" />;
}

export function DeletedEventsModalLoading() {
  return <DialogSkeleton header="header" className="max-w-2xl" />;
}
