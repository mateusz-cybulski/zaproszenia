"use client";

import type { ReactNode } from "react";

import type { Guest } from "@/entities/guest";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { GUEST_DIALOG_COPY } from "../config/guest-dialog-copy";
import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";
import { GuestForm } from "./guest-form";

type GuestDialogProps = {
  guest?: Guest;
  dismissal: Dismissal;
  headerActions?: ReactNode;
};

export function GuestDialog({ guest, dismissal, headerActions }: GuestDialogProps) {
  const dismiss = useDismiss(dismissal, routes.guests());
  const copy = guest ? GUEST_DIALOG_COPY.edit : GUEST_DIALOG_COPY.add;

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex items-start gap-4">
          <div className="grid flex-1 gap-1.5">
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </div>
          {/* The 20px badge sits 2px higher to share the 16px title's centre line. */}
          {headerActions && <div className="-mt-0.5">{headerActions}</div>}
        </DialogHeader>
        <DialogBody>
          <GuestForm guest={guest} onSaved={dismiss} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
