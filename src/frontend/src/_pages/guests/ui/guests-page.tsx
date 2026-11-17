import { connection } from "next/server";

import { GuestTable } from "@/entities/guest";
import { getGuests } from "@/entities/guest/index.server";
import { GuestForm } from "@/features/save-guest";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import { getViewer } from "../api/viewer-api";
import { LoginScreen } from "./login-screen";
import { LogoutButton } from "./logout-button";

export async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // API_URL exists only at runtime on Cloud Run, so render on every request.
  await connection();
  // The home page doubles as the sign-in page: other pages send visitors without a session here.
  const viewer = await getViewer();
  if (!viewer) {
    const { verified } = await searchParams;
    return <LoginScreen verified={verified === "1"} />;
  }
  const guests = await getGuests();

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Goście</h1>
        <div className="flex items-center gap-3">
          {viewer.email && <p className="text-sm text-muted-foreground">{viewer.email}</p>}
          <LogoutButton />
        </div>
      </header>

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
    </main>
  );
}
