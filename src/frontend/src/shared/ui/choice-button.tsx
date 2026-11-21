import { LoaderCircle, type LucideIcon } from "lucide-react";

type ChoiceButtonProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  pending?: boolean;
  disabled?: boolean;
  tone?: "default" | "destructive";
  onClick?: () => void;
};

export function ChoiceButton({
  icon: Icon,
  title,
  description,
  pending = false,
  disabled = false,
  tone = "default",
  onClick,
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      data-tone={tone}
      className="group flex items-start gap-3 rounded-lg border p-4 text-left transition outline-none hover:border-primary hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[tone=destructive]:hover:border-destructive data-[tone=destructive]:hover:bg-destructive/5"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted group-data-[tone=destructive]:bg-destructive/10 group-data-[tone=destructive]:text-destructive">
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Icon className="size-4" />}
      </span>
      <span className="grid gap-0.5">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
