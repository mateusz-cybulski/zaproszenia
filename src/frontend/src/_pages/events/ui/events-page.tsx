import { ArchiveRestore, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { EventTable } from "@/entities/event";
import { getEvents } from "@/entities/event/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import { parsePage } from "@/shared/lib/pagination";
import { routes, type SearchParams, withQuery } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/ui/page";
import { ListPagination } from "@/shared/ui/list-pagination";

import { EVENTS_PAGE } from "../config/page-copy";
import { EventRowActions } from "./event-row-actions";

export const metadata: Metadata = { title: "Wydarzenia · Zaproszenia" };

async function requestTime(): Promise<number> {
  await connection();
  return Date.now();
}

export async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  const { page: pageParam } = await searchParams;
  const [events, now] = await Promise.all([
    getEvents({ page: parsePage(pageParam) }),
    requestTime(),
  ]);
  const hrefForPage = (page: number) =>
    withQuery(routes.events(), { page: page > 1 ? page : undefined });

  return (
    <Page
      title={EVENTS_PAGE.title}
      description={EVENTS_PAGE.description}
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
          events={events.items}
          now={now}
          emptyMessage="Nie dodano jeszcze żadnych wydarzeń."
          hrefFor={(event) => routes.event(event.id)}
          renderActions={(event) => <EventRowActions event={event} />}
        />
      </div>
      <ListPagination
        page={events.page}
        pageSize={events.pageSize}
        total={events.total}
        hrefForPage={hrefForPage}
      />
    </Page>
  );
}
