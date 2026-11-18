import type { Metadata } from "next";

import { GuestTable } from "@/entities/guest";
import { getGuests } from "@/entities/guest/index.server";
import { AddGuestDialog } from "@/features/save-guest";
import { VerificationMenu, VerifyAllDialog } from "@/features/verify-guest";
import { Page } from "@/shared/ui/page";

import { SEARCH_MAX_LENGTH } from "../config/search";
import { GuestSearch } from "./guest-search";

export const metadata: Metadata = { title: "Goście · Zaproszenia" };

type GuestsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function GuestsPage({ searchParams }: GuestsPageProps) {
  const { q } = await searchParams;
  const search = typeof q === "string" ? q.trim().slice(0, SEARCH_MAX_LENGTH) : "";
  const guests = await getGuests({ search });

  return (
    <Page
      title="Goście"
      description="Baza gości, których zapraszasz na wydarzenia."
      actions={
        <>
          <VerifyAllDialog />
          <AddGuestDialog />
        </>
      }
    >
      <GuestSearch initialSearch={search} />
      <div className="rounded-lg border">
        <GuestTable
          guests={guests}
          emptyMessage={search ? "Brak wyników." : "Nie dodano jeszcze żadnych gości."}
          renderVerification={(guest) => <VerificationMenu guest={guest} />}
        />
      </div>
    </Page>
  );
}
