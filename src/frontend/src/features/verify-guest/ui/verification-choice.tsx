import { LoaderCircle, type LucideIcon } from "lucide-react";

type VerificationChoiceProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  pending?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function VerificationChoice({
  icon: Icon,
  title,
  description,
  pending = false,
  disabled = false,
  onClick,
}: VerificationChoiceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-start gap-3 rounded-lg border p-4 text-left transition outline-none hover:border-primary hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Icon className="size-4" />}
      </span>
      <span className="grid gap-0.5">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
