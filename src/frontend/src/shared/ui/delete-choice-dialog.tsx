"use client";

import { Archive, Trash } from "lucide-react";
import { type ReactNode, useState } from "react";

import type { ActionResult } from "@/shared/lib/actions";
import { useAction } from "@/shared/lib/action-call";
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
  remove: (permanent: boolean) => Promise<ActionResult>;
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
  const [pendingChoice, setPendingChoice] = useState<"soft" | "permanent" | null>(null);
  const { run, pending, error, setError } = useAction(remove, {
    onSuccess: () => changeOpen(false),
  });

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    setError(null);
  }

  function choose(isPermanent: boolean) {
    setPendingChoice(isPermanent ? "permanent" : "soft");
    run(isPermanent);
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
