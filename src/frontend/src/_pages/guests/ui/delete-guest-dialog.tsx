"use client";

import { Trash } from "lucide-react";

import { type Guest, recipientName } from "@/entities/guest";
import { Button } from "@/shared/ui/button";
import { DeleteChoiceDialog } from "@/shared/ui/delete-choice-dialog";

import { deleteGuestAction } from "../api/delete-guest-action";
import { DELETE_COPY } from "../config/delete-copy";

export function DeleteGuestDialog({ guest }: { guest: Guest }) {
  const name = recipientName(guest);

  return (
    <DeleteChoiceDialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Usuń: ${name}`}>
          <Trash />
        </Button>
      }
      title={`Usunąć gościa „${name}”?`}
      description="Wybierz, czy gość ma trafić do usuniętych, czy zniknąć na stałe."
      soft={{ title: DELETE_COPY.softTitle, description: DELETE_COPY.softDescription }}
      permanent={{
        title: DELETE_COPY.permanentTitle,
        description: DELETE_COPY.permanentDescription,
      }}
      remove={(permanent) => deleteGuestAction(guest.id, permanent)}
    />
  );
}
