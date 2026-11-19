import type { Metadata } from "next";

import { getSender } from "@/entities/viewer/index.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Page } from "@/shared/ui/page";

import { DeleteAccountDialog } from "./delete-account-dialog";
import { SenderForm } from "./sender-form";

export const metadata: Metadata = { title: "Ustawienia · Zaproszenia" };

export async function SettingsPage() {
  const sender = await getSender();

  return (
    <Page title="Ustawienia" description={sender.email ?? undefined}>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Nadawca</CardTitle>
          <CardDescription>
            Drukujemy go jako adres zwrotny na kopertach i jako podpis zaproszenia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SenderForm sender={sender} />
        </CardContent>
      </Card>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Usuń wszystkie dane</CardTitle>
          <CardDescription>
            Trwale usuwa gości, szablony z plikami i dane nadawcy oraz zamyka konto logowania (prawo
            do usunięcia danych, RODO).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </Page>
  );
}
