"use client";

import { Trash } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/shared/ui/button";

type PurgeButtonProps = {
  name: string;
  pending: boolean;
  disabled?: boolean;
  onPurge: () => void;
};

export function PurgeButton({ name, pending, disabled, onPurge }: PurgeButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const purgeButton = useRef<HTMLButtonElement>(null);

  function cancel() {
    setConfirming(false);
    // The confirm buttons unmount; without this the focus falls back to the whole dialog.
    requestAnimationFrame(() => purgeButton.current?.focus());
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
      <Button variant="ghost" size="sm" onClick={cancel} aria-disabled={pending}>
        Anuluj
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onPurge}
        pending={pending}
        icon={<Trash />}
        aria-label={`Potwierdź usunięcie na stałe: ${name}`}
        autoFocus
      >
        Potwierdź
      </Button>
    </>
  );
}
