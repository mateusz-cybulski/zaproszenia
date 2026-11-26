import { ArchiveRestore, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getEvents } from "@/entities/event/index.server";
import { GuestTable, recipientName } from "@/entities/guest";
import { getGuests } from "@/entities/guest/index.server";
import { SEARCH_MAX_LENGTH } from "@/shared/config";
import { parsePage } from "@/shared/lib/pagination";
import { routes, type SearchParams, withQuery } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/ui/page";
import { ListPagination } from "@/shared/ui/list-pagination";

import { GUESTS_PAGE } from "../config/page-copy";
import { GuestSelectionProvider } from "../model/guest-selection-context";
import { GuestRowActions } from "./guest-row-actions";
import { GuestSelectCheckbox } from "./guest-select-checkbox";
import { GuestSelectionToolbar } from "./guest-selection-toolbar";
import { GuestSearch } from "./guest-search";
import { SelectPageCheckbox } from "./select-page-checkbox";
import { VerificationMenu } from "./verification-menu";
import { ImportGuestsDialog } from "./import-guests-dialog";

export const metadata: Metadata = { title: "Goście · Zaproszenia" };

export type GuestsPageProps = { searchParams: SearchParams };

export async function GuestsPage({ searchParams }: GuestsPageProps) {
  const { q, page: pageParam } = await searchParams;
  const search = typeof q === "string" ? q.trim().slice(0, SEARCH_MAX_LENGTH) : "";
  const [guests, events] = await Promise.all([
    getGuests({ search, page: parsePage(pageParam) }),
    getEvents(),
  ]);
  const pageIds = guests.items.map((guest) => guest.id);
  const hrefForPage = (page: number) =>
    withQuery(routes.guests(), { q: search || undefined, page: page > 1 ? page : undefined });

  return (
    <Page
      title={GUESTS_PAGE.title}
      description={GUESTS_PAGE.description}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={routes.guestsDeleted()} scroll={false}>
              <ArchiveRestore /> Przywróć
            </Link>
          </Button>
          <ImportGuestsDialog />
          <Button asChild>
            <Link href={routes.guestAdd()} scroll={false}>
              <Plus /> Dodaj gościa
            </Link>
          </Button>
        </>
      }
    >
      <GuestSearch initialSearch={search} />
      <GuestSelectionProvider>
        <GuestSelectionToolbar events={events.items} />
        <div className="rounded-lg border">
          <GuestTable
            guests={guests.items}
            emptyMessage={search ? "Brak wyników." : "Nie dodano jeszcze żadnych gości."}
            hrefFor={(guest) => routes.guestEdit(guest.id)}
            selectionHeader={
              // A new page or search starts unticked.
              <SelectPageCheckbox key={pageIds.join()} ids={pageIds} />
            }
            renderSelection={(guest) => (
              <GuestSelectCheckbox id={guest.id} name={recipientName(guest)} />
            )}
            renderVerification={(guest) => <VerificationMenu guest={guest} />}
            renderActions={(guest) => <GuestRowActions guest={guest} />}
          />
        </div>
      </GuestSelectionProvider>
      <ListPagination
        page={guests.page}
        pageSize={guests.pageSize}
        total={guests.total}
        hrefForPage={hrefForPage}
      />
    </Page>
  );
}
