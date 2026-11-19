"use client";

import { ArchiveRestore, LoaderCircle } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/shared/ui/button";

type RestoreButtonProps = {
  name: string;
  restore: () => Promise<{ error?: string }>;
  disabled?: boolean;
  onError: (error: string | null) => void;
};

export function RestoreButton({ name, restore, disabled, onError }: RestoreButtonProps) {
  const [pending, startTransition] = useTransition();

  function run() {
    onError(null);
    startTransition(async () => {
      const result = await restore();
      onError(result.error ?? null);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={run}
      disabled={disabled || pending}
      aria-label={`Przywróć: ${name}`}
    >
      {pending ? <LoaderCircle className="animate-spin" /> : <ArchiveRestore />} Przywróć
    </Button>
  );
}
