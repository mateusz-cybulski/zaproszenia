import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuest } from "@/entities/guest/index.server";
import { GuestForm } from "@/features/save-guest";
import { VerificationMenu } from "@/features/verify-guest";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Page } from "@/shared/ui/page";

export const metadata: Metadata = { title: "Edycja gościa · Zaproszenia" };

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
    <Page
      title="Edytuj gościa"
      actions={
        <>
          <VerificationMenu guest={guest} />
          <Button asChild variant="outline">
            <Link href={routes.guests()}>← Wróć do listy</Link>
          </Button>
        </>
      }
    >
      <Card className="max-w-3xl">
        <CardContent>
          <GuestForm guest={guest} />
        </CardContent>
      </Card>
    </Page>
  );
}
