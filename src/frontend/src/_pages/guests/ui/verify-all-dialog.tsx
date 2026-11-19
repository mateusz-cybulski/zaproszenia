"use client";

import { ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/shared/ui/button";
import { ChoiceButton } from "@/shared/ui/choice-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { verifyAllGuestsManuallyAction } from "../api/verify-all-guests-manually-action";

export function VerifyAllDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    setError(null);
  }

  function verifyManually() {
    startTransition(async () => {
      const result = await verifyAllGuestsManuallyAction();
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
        <Button variant="outline">
          <ShieldCheck /> Zweryfikuj wszystkich
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jak zweryfikować dane?</DialogTitle>
          <DialogDescription>
            Wszyscy goście, którzy nie są jeszcze zweryfikowani.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <ChoiceButton
            icon={Sparkles}
            title="Sprawdź z AI"
            description="AI sprawdzi tytuły, nazwy instytucji i adres oraz zaproponuje zwrot grzecznościowy. Dostępne wkrótce."
            disabled
          />
          <ChoiceButton
            icon={UserCheck}
            title="Zatwierdź ręcznie"
            description="Dane są poprawne: sprawdziłeś je sam i nie potrzebujesz AI."
            pending={pending}
            disabled={pending}
            onClick={verifyManually}
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
