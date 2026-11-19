"use client";

import { Trash } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { ConfirmActionDialog } from "@/shared/ui/confirm-action-dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { deleteAccountAction } from "../api/delete-account-action";
import { DELETE_CONFIRMATION } from "../config/messages";

export function DeleteAccountDialog() {
  const [confirmation, setConfirmation] = useState("");

  return (
    <ConfirmActionDialog
      trigger={
        <Button variant="destructive">
          <Trash /> Usuń moje dane
        </Button>
      }
      title="Usunąć wszystkie dane i konto?"
      description="Goście, szablony z plikami PDF i dane nadawcy zostaną usunięte, a konto logowania zamknięte. Tego nie da się cofnąć."
      tone="destructive"
      confirmLabel={
        <>
          <Trash /> Usuń wszystko
        </>
      }
      pendingLabel={
        <>
          <Trash /> Usuwanie…
        </>
      }
      confirmDisabled={confirmation !== DELETE_CONFIRMATION}
      onOpenChange={() => setConfirmation("")}
      action={() => deleteAccountAction(confirmation)}
    >
      <div className="grid gap-2">
        <Label htmlFor="delete-confirmation">Wpisz „{DELETE_CONFIRMATION}”, aby potwierdzić</Label>
        <Input
          id="delete-confirmation"
          value={confirmation}
          autoComplete="off"
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </div>
    </ConfirmActionDialog>
  );
}
