"use client";

import { Archive, Trash } from "lucide-react";
import { useState, useTransition } from "react";

import { type Guest, recipientName } from "@/entities/guest";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { deleteGuestAction } from "../api/delete-guest-action";
import { deleteCopy } from "../config/delete-copy";
import { ChoiceButton } from "./choice-button";

export function DeleteGuestDialog({ guest }: { guest: Guest }) {
  const name = recipientName(guest);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChoice, setPendingChoice] = useState<"soft" | "permanent" | null>(null);
  const [pending, startTransition] = useTransition();

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    setError(null);
  }

  function remove(permanent: boolean) {
    setPendingChoice(permanent ? "permanent" : "soft");
    startTransition(async () => {
      const result = await deleteGuestAction(guest.id, permanent);
      if (result.error) {
        setError(result.error);
      } else {
        changeOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Usuń: ${name}`}>
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usunąć gościa „{name}”?</DialogTitle>
          <DialogDescription>
            Wybierz, czy gość ma trafić do usuniętych, czy zniknąć na stałe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <ChoiceButton
            icon={Archive}
            title={deleteCopy.softTitle}
            description={deleteCopy.softDescription}
            pending={pending && pendingChoice === "soft"}
            disabled={pending}
            onClick={() => remove(false)}
          />
          <ChoiceButton
            icon={Trash}
            title={deleteCopy.permanentTitle}
            description={deleteCopy.permanentDescription}
            tone="destructive"
            pending={pending && pendingChoice === "permanent"}
            disabled={pending}
            onClick={() => remove(true)}
          />
        </div>
        <p role="alert" className="text-sm text-destructive empty:hidden">
          {error}
        </p>
      </DialogContent>
    </Dialog>
  );
}
