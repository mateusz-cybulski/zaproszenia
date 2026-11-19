"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { ActionResult } from "@/shared/lib/actions";
import { useAction } from "@/shared/lib/action-call";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

type ConfirmActionDialogProps = {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: ReactNode;
  pendingLabel: ReactNode;
  action: () => Promise<ActionResult>;
  tone?: "default" | "destructive";
  confirmDisabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

// Open, confirm, run the action: success closes the dialog, an error stays in it.
export function ConfirmActionDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel,
  action,
  tone = "default",
  confirmDisabled = false,
  onOpenChange,
  children,
}: ConfirmActionDialogProps) {
  const [open, setOpen] = useState(false);
  const { run, pending, error, setError } = useAction(action, {
    onSuccess: () => changeOpen(false),
  });

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    setError(null);
    onOpenChange?.(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {children}
          <p role="alert" className="text-sm text-destructive empty:hidden">
            {error}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => changeOpen(false)}>
              Anuluj
            </Button>
            <Button
              variant={tone === "destructive" ? "destructive" : "default"}
              onClick={() => run()}
              disabled={pending || confirmDisabled}
            >
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
