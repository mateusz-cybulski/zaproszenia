"use client";

import { Archive, Trash } from "lucide-react";
import { type ReactNode, useState, useTransition } from "react";

import { ChoiceButton } from "@/shared/ui/choice-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

type Choice = { title: string; description: string };

type DeleteChoiceDialogProps = {
  trigger: ReactNode;
  title: string;
  description: string;
  soft: Choice;
  permanent: Choice;
  remove: (permanent: boolean) => Promise<{ error?: string }>;
};

export function DeleteChoiceDialog({
  trigger,
  title,
  description,
  soft,
  permanent,
  remove,
}: DeleteChoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChoice, setPendingChoice] = useState<"soft" | "permanent" | null>(null);
  const [pending, startTransition] = useTransition();

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    setError(null);
  }

  function choose(isPermanent: boolean) {
    setPendingChoice(isPermanent ? "permanent" : "soft");
    startTransition(async () => {
      const result = await remove(isPermanent);
      if (result.error) {
        setError(result.error);
      } else {
        changeOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <ChoiceButton
            icon={Archive}
            title={soft.title}
            description={soft.description}
            pending={pending && pendingChoice === "soft"}
            disabled={pending}
            onClick={() => choose(false)}
          />
          <ChoiceButton
            icon={Trash}
            title={permanent.title}
            description={permanent.description}
            tone="destructive"
            pending={pending && pendingChoice === "permanent"}
            disabled={pending}
            onClick={() => choose(true)}
          />
        </div>
        <p role="alert" className="text-sm text-destructive empty:hidden">
          {error}
        </p>
      </DialogContent>
    </Dialog>
  );
}
