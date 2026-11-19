import { parseEventSection } from "../model/event-section";
import { EventEditDialog } from "./event-edit-dialog";
import { EventsPage } from "./events-page";

type EventRouteProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function EventEditModal({ params, searchParams }: EventRouteProps) {
  const [{ id }, { section }] = await Promise.all([params, searchParams]);
  return <EventEditDialog id={id} section={parseEventSection(section)} dismissal="back" />;
}

export async function EventsEditPage({ params, searchParams }: EventRouteProps) {
  const [{ id }, { section }] = await Promise.all([params, searchParams]);
  return (
    <>
      <EventsPage />
      <EventEditDialog id={id} section={parseEventSection(section)} dismissal="to-list" />
    </>
  );
}
