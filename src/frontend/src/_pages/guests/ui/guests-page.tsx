import { ArchiveRestore, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GuestTable } from "@/entities/guest";
import { getGuests } from "@/entities/guest/index.server";
import { SEARCH_MAX_LENGTH } from "@/shared/config";
import { parsePage } from "@/shared/lib/pagination";
import { routes, type SearchParams, withQuery } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/ui/page";
import { Pagination } from "@/shared/ui/pagination";

import { GuestRowActions } from "./guest-row-actions";
import { GuestSearch } from "./guest-search";
import { VerificationMenu } from "./verification-menu";
import { VerifyAllDialog } from "./verify-all-dialog";

export const metadata: Metadata = { title: "Goście · Zaproszenia" };

export type GuestsPageProps = { searchParams: SearchParams };

export async function GuestsPage({ searchParams }: GuestsPageProps) {
  const { q, page: pageParam } = await searchParams;
  const search = typeof q === "string" ? q.trim().slice(0, SEARCH_MAX_LENGTH) : "";
  const guests = await getGuests({ search, page: parsePage(pageParam) });
  const hrefForPage = (page: number) =>
    withQuery(routes.guests(), { q: search || undefined, page: page > 1 ? page : undefined });

  return (
    <Page
      title="Goście"
      description="Baza gości, których zapraszasz na wydarzenia."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={routes.guestsDeleted()} scroll={false}>
              <ArchiveRestore /> Przywróć
            </Link>
          </Button>
          <VerifyAllDialog />
          <Button asChild>
            <Link href={routes.guestAdd()} scroll={false}>
              <Plus /> Dodaj gościa
            </Link>
          </Button>
        </>
      }
    >
      <GuestSearch initialSearch={search} />
      <div className="rounded-lg border">
        <GuestTable
          guests={guests.items}
          emptyMessage={search ? "Brak wyników." : "Nie dodano jeszcze żadnych gości."}
          renderVerification={(guest) => <VerificationMenu guest={guest} />}
          renderActions={(guest) => <GuestRowActions guest={guest} />}
        />
      </div>
      <Pagination
        page={guests.page}
        pageSize={guests.pageSize}
        total={guests.total}
        hrefForPage={hrefForPage}
      />
    </Page>
  );
}
