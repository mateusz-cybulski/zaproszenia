import { ArchiveRestore } from "lucide-react";

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
      disabled={disabled}
      pending={pending}
      icon={<ArchiveRestore />}
      aria-label={`Przywróć: ${name}`}
    >
      Przywróć
    </Button>
  );
}
