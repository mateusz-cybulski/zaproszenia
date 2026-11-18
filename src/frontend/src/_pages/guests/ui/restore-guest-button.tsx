"use client";

import { ArchiveRestore, LoaderCircle } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/shared/ui/button";

import { restoreGuestAction } from "../api/restore-guest-action";

type RestoreGuestButtonProps = {
  guestId: number;
  name: string;
  disabled?: boolean;
  onError: (error: string | null) => void;
};

export function RestoreGuestButton({ guestId, name, disabled, onError }: RestoreGuestButtonProps) {
  const [pending, startTransition] = useTransition();

  function restore() {
    onError(null);
    startTransition(async () => {
      const result = await restoreGuestAction(guestId);
      onError(result.error ?? null);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={restore}
      disabled={disabled || pending}
      aria-label={`Przywróć: ${name}`}
    >
      {pending ? <LoaderCircle className="animate-spin" /> : <ArchiveRestore />} Przywróć
    </Button>
  );
}
