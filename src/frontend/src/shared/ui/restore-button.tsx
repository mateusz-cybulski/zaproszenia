import { ArchiveRestore, LoaderCircle } from "lucide-react";

import { Button } from "@/shared/ui/button";

type RestoreButtonProps = {
  name: string;
  pending: boolean;
  disabled?: boolean;
  onRestore: () => void;
};

export function RestoreButton({ name, pending, disabled, onRestore }: RestoreButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRestore}
      disabled={disabled || pending}
      aria-label={`Przywróć: ${name}`}
    >
      {pending ? <LoaderCircle className="animate-spin" /> : <ArchiveRestore />} Przywróć
    </Button>
  );
}
