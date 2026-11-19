"use client";

import type { ReactNode } from "react";

import type { Guest } from "@/entities/guest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { guestDialogCopy } from "../config/guest-dialog-copy";
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
  const copy = guest ? guestDialogCopy.edit : guestDialogCopy.add;

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-start gap-4 pr-8">
          <DialogHeader className="flex-1">
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          {/* The 20px badge sits 2px higher to share the 16px title's centre line. */}
          {headerActions && <div className="-mt-0.5">{headerActions}</div>}
        </div>
        <GuestForm guest={guest} onSaved={dismiss} />
      </DialogContent>
    </Dialog>
  );
}
