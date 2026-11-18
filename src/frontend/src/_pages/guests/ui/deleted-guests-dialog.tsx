"use client";

import type { Guest } from "@/entities/guest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import type { Dismissal } from "../model/dismissal";
import { useDismiss } from "../model/use-dismiss";
import { DeletedGuestRow } from "./deleted-guest-row";

type DeletedGuestsDialogProps = { guests: Guest[]; dismissal: Dismissal };

export function DeletedGuestsDialog({ guests, dismissal }: DeletedGuestsDialogProps) {
  const dismiss = useDismiss(dismissal);

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pr-8">
          <DialogTitle>Usunięci goście</DialogTitle>
          <DialogDescription>
            Przywrócony gość wraca na listę z dotychczasowymi danymi. Usunięcia na stałe nie da się
            cofnąć.
          </DialogDescription>
        </DialogHeader>
        {guests.length > 0 ? (
          <ul className="divide-y">
            {guests.map((guest) => (
              <DeletedGuestRow key={guest.id} guest={guest} />
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Nie ma usuniętych gości.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
