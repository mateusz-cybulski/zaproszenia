"use client";

import type { Guest } from "@/entities/guest";
import type { Page } from "@/shared/api";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Pagination } from "@/shared/ui/pagination";

import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes, withQuery } from "@/shared/routes";
import { DeletedGuestRow } from "./deleted-guest-row";

type DeletedGuestsDialogProps = { guests: Page<Guest>; dismissal: Dismissal };

export function DeletedGuestsDialog({ guests, dismissal }: DeletedGuestsDialogProps) {
  const dismiss = useDismiss(dismissal, routes.guests());

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Usunięci goście</DialogTitle>
          <DialogDescription>
            Przywrócony gość wraca na listę z dotychczasowymi danymi. Usunięcia na stałe nie da się
            cofnąć.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {guests.items.length > 0 ? (
            <ul className="divide-y">
              {guests.items.map((guest) => (
                <DeletedGuestRow key={guest.id} guest={guest} />
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nie ma usuniętych gości.
            </p>
          )}
          <Pagination
            page={guests.page}
            pageSize={guests.pageSize}
            total={guests.total}
            hrefForPage={(page) =>
              withQuery(routes.guestsDeleted(), { deleted_page: page > 1 ? page : undefined })
            }
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
