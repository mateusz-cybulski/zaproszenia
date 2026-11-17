import type { Metadata } from "next";

import { GuestTable } from "@/entities/guest";
import { getGuests } from "@/entities/guest/index.server";
import { GuestForm } from "@/features/save-guest";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Page } from "@/shared/ui/page";

export const metadata: Metadata = { title: "Goście · Zaproszenia" };

export async function GuestsPage() {
  const guests = await getGuests();

  return (
    <Page title="Goście">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Dodaj gościa</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GuestForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Lista gości ({guests.length})</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GuestTable guests={guests} />
        </CardContent>
      </Card>
    </Page>
  );
}
