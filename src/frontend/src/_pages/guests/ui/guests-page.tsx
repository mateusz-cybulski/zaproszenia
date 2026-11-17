import type { Metadata } from "next";

import { GuestTable } from "@/entities/guest";
import { getGuests } from "@/entities/guest/index.server";
import { GuestForm } from "@/features/save-guest";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export const metadata: Metadata = { title: "Goście · Zaproszenia" };

export async function GuestsPage() {
  const guests = await getGuests();

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Goście</h1>

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
    </div>
  );
}
