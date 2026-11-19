import { EventAddDialog } from "./event-add-dialog";
import { EventsPage } from "./events-page";

export function EventAddModal() {
  return <EventAddDialog dismissal="back" />;
}

export function EventsAddPage() {
  return (
    <>
      <EventsPage />
      <EventAddDialog dismissal="to-list" />
    </>
  );
}
