import type { SearchParams } from "@/shared/routes";

import { EventAddDialog } from "./event-add-dialog";
import { EventsPage } from "./events-page";

export function EventAddModal() {
  return <EventAddDialog dismissal="back" />;
}

export function EventsAddPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <EventsPage searchParams={searchParams} />
      <EventAddDialog dismissal="to-list" />
    </>
  );
}
