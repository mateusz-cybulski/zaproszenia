import type { Metadata } from "next";

import { requireViewer } from "@/entities/viewer/index.server";
import { Card, CardContent } from "@/shared/ui/card";
import { Page } from "@/shared/ui/page";

export const metadata: Metadata = { title: "Wydarzenia · Zaproszenia" };

export async function EventsPage() {
  // The layout's session check does not run on link navigation.
  await requireViewer();

  return (
    <Page title="Wydarzenia">
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tu pojawią się wydarzenia, na które wysyłasz zaproszenia. Sekcja jest w przygotowaniu.
          </p>
        </CardContent>
      </Card>
    </Page>
  );
}
