import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuest } from "@/entities/guest/index.server";
import { GuestForm } from "@/features/save-guest";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type GuestEditPageProps = {
  params: Promise<{ id: string }>;
};

export async function GuestEditPage({ params }: GuestEditPageProps) {
  const { id } = await params;
  const guestId = Number(id);
  if (!Number.isSafeInteger(guestId) || guestId < 1) {
    notFound();
  }
  const guest = await getGuest(guestId);
  if (!guest) {
    notFound();
  }

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-8">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.home()}>← Wróć do listy</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Edytuj gościa</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GuestForm guest={guest} />
        </CardContent>
      </Card>
    </main>
  );
}
