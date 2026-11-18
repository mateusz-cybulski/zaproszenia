import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GuestTable } from "@/entities/guest";
import { getGuests } from "@/entities/guest/index.server";
import { VerificationMenu } from "./verification-menu";
import { VerifyAllDialog } from "./verify-all-dialog";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/ui/page";

import { SEARCH_MAX_LENGTH } from "../config/search";
import { GuestSearch } from "./guest-search";

export const metadata: Metadata = { title: "Goście · Zaproszenia" };

export type GuestsPageProps = {
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
          guests={guests}
          emptyMessage={search ? "Brak wyników." : "Nie dodano jeszcze żadnych gości."}
          renderVerification={(guest) => <VerificationMenu guest={guest} />}
        />
      </div>
    </Page>
  );
}
