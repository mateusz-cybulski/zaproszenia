import Link from "next/link";

import { type Guest, recipientName } from "@/entities/guest";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";

import { DeleteGuestDialog } from "./delete-guest-dialog";

export function GuestRowActions({ guest }: { guest: Guest }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="outline" size="sm">
        <Link href={routes.guestEdit(guest.id)} scroll={false}>
          Edytuj<span className="sr-only"> {recipientName(guest)}</span>
        </Link>
      </Button>
      <DeleteGuestDialog guest={guest} />
    </div>
  );
}
