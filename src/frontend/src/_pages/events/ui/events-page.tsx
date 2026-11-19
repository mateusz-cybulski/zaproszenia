import { ArchiveRestore, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { EventTable } from "@/entities/event";
import { getEvents } from "@/entities/event/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/ui/page";

import { EventRowActions } from "./event-row-actions";

export const metadata: Metadata = { title: "Wydarzenia · Zaproszenia" };

async function requestTime(): Promise<number> {
  await connection();
  return Date.now();
}

export async function EventsPage() {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  const [events, now] = await Promise.all([getEvents(), requestTime()]);

  return (
    <Page
      title="Wydarzenia"
      description="Wydarzenia, na które wysyłasz zaproszenia."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={routes.eventsDeleted()} scroll={false}>
              <ArchiveRestore /> Przywróć
            </Link>
          </Button>
          <Button asChild>
            <Link href={routes.eventAdd()} scroll={false}>
              <Plus /> Dodaj wydarzenie
            </Link>
          </Button>
        </>
      }
    >
      <div className="rounded-lg border">
        <EventTable
          events={events}
          now={now}
          emptyMessage="Nie dodano jeszcze żadnych wydarzeń."
          renderActions={(event) => <EventRowActions event={event} />}
        />
      </div>
    </Page>
  );
}
