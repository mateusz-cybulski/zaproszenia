"use client";

import { LoaderCircle, Trash } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/shared/ui/button";

import { deleteGuestAction } from "../api/delete-guest-action";

type PurgeGuestButtonProps = {
  guestId: number;
  name: string;
  disabled?: boolean;
  onError: (error: string | null) => void;
};

export function PurgeGuestButton({ guestId, name, disabled, onError }: PurgeGuestButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const purgeButton = useRef<HTMLButtonElement>(null);

  function cancel() {
    setConfirming(false);
    // The confirm buttons unmount; without this the focus falls back to the whole dialog.
    requestAnimationFrame(() => purgeButton.current?.focus());
  }

  function purge() {
    onError(null);
    startTransition(async () => {
      const result = await deleteGuestAction(guestId, true);
      onError(result.error ?? null);
      setConfirming(false);
    });
  }

  if (!confirming) {
    return (
      <Button
        ref={purgeButton}
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(true)}
        disabled={disabled}
        aria-label={`Usuń na stałe: ${name}`}
      >
        <Trash /> Usuń na stałe
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={cancel} disabled={pending}>
        Anuluj
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={purge}
        disabled={pending}
        aria-label={`Potwierdź usunięcie na stałe: ${name}`}
        autoFocus
      >
        {pending ? <LoaderCircle className="animate-spin" /> : <Trash />} Potwierdź
      </Button>
    </>
  );
}
