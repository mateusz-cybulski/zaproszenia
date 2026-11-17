import type { Metadata } from "next";

import { requireViewer } from "@/entities/viewer/index.server";
import { Card, CardContent } from "@/shared/ui/card";

export const metadata: Metadata = { title: "Wydarzenia · Zaproszenia" };

export async function EventsPage() {
  // The layout's session check does not run on link navigation.
  await requireViewer();

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Wydarzenia</h1>
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tu pojawią się wydarzenia, na które wysyłasz zaproszenia. Sekcja jest w przygotowaniu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
