import { ArchiveRestore, CalendarDays, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { getEvents } from "@/entities/event/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/ui/page";

import { EventGrid } from "./event-grid";

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
              <Plus /> Nowe wydarzenie
            </Link>
          </Button>
        </>
      }
    >
      {events.length > 0 ? (
        <EventGrid events={events} now={now} />
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" aria-hidden /> Utwórz wydarzenie, dodaj gości i wygeneruj
          zaproszenia.
        </p>
      )}
    </Page>
  );
}
