"use client";

import type { ReactNode } from "react";

import type { Guest } from "@/entities/guest";
import { type Dismissal, useDismiss, useReturnFocus } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogBody, DialogContent, DialogTitleBar } from "@/shared/ui/dialog";
import { DialogNameField } from "@/shared/ui/dialog-name-field";
import { FormStatus } from "@/shared/ui/form-status";

import { GUEST_DIALOG_COPY } from "../config/guest-dialog-copy";
import { FULL_NAME_FIELD } from "../config/guest-fields";
import { useGuestForm } from "../model/use-guest-form";
import { GuestForm } from "./guest-form";

type GuestDialogProps = {
  guest?: Guest;
  dismissal: Dismissal;
  headerActions?: ReactNode;
};

export function GuestDialog({ guest, dismissal, headerActions }: GuestDialogProps) {
  const dismiss = useDismiss(dismissal, routes.guests());
  const returnFocus = useReturnFocus();
  const copy = guest ? GUEST_DIALOG_COPY.edit : GUEST_DIALOG_COPY.add;
  const guestForm = useGuestForm(guest, dismiss);
  const nameMeta = guestForm.fields[FULL_NAME_FIELD.name];

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent
        onCloseAutoFocus={returnFocus}
        className="max-w-2xl"
        aria-describedby={undefined}
      >
        <DialogTitleBar
          start={headerActions}
          end={
            <>
              <FormStatus result={guestForm.lastResult} />
              <Button type="submit" form={guestForm.form.id} aria-disabled={guestForm.pending}>
                {guestForm.pending ? copy.pending : copy.submit}
              </Button>
            </>
          }
        >
          <DialogNameField
            key={nameMeta.key}
            label={FULL_NAME_FIELD.label}
            title={guest ? (guest.fullName ?? guest.institution ?? copy.title) : copy.title}
            form={guestForm.form.id}
            id={nameMeta.id}
            name={nameMeta.name}
            defaultValue={nameMeta.defaultValue ?? ""}
            placeholder={FULL_NAME_FIELD.placeholder}
            maxLength={FULL_NAME_FIELD.maxLength}
            error={nameMeta.errors?.[0]}
            errorId={nameMeta.errorId}
          />
        </DialogTitleBar>
        <DialogBody>
          <GuestForm guestForm={guestForm} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
