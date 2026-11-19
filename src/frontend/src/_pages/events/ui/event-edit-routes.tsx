import { EventEditDialog } from "./event-edit-dialog";
import { EventsPage } from "./events-page";

type EventRouteParams = { params: Promise<{ id: string }> };

export async function EventEditModal({ params }: EventRouteParams) {
  const { id } = await params;
  return <EventEditDialog id={id} dismissal="back" />;
}

export async function EventsEditPage({ params }: EventRouteParams) {
  const { id } = await params;
  return (
    <>
      <EventsPage />
      <EventEditDialog id={id} dismissal="to-list" />
    </>
  );
}
