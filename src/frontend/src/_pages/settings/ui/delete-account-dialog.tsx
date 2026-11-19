"use client";

import { Trash } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { deleteAccountAction } from "../api/delete-account-action";
import { DELETE_CONFIRMATION } from "../config/messages";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    setConfirmation("");
    setError(null);
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccountAction(confirmation);
      setError(result.error ?? null);
    });
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash /> Usuń moje dane
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usunąć wszystkie dane i konto?</DialogTitle>
          <DialogDescription>
            Goście, szablony z plikami PDF i dane nadawcy zostaną usunięte, a konto logowania
            zamknięte. Tego nie da się cofnąć.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="delete-confirmation">
            Wpisz „{DELETE_CONFIRMATION}”, aby potwierdzić
          </Label>
          <Input
            id="delete-confirmation"
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>
        <p role="alert" className="text-sm text-destructive empty:hidden">
          {error}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => changeOpen(false)}>
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={remove}
            disabled={pending || confirmation !== DELETE_CONFIRMATION}
          >
            <Trash /> {pending ? "Usuwanie…" : "Usuń wszystko"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
