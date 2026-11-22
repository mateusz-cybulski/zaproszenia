"use client";

import { type ReturnFocus, useDiscardGuard } from "@/shared/lib/dialogs";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogBody, DialogContent, DialogTitleBar } from "@/shared/ui/dialog";
import { DiscardChangesDialog } from "@/shared/ui/discard-changes-dialog";
import { FormStatus } from "@/shared/ui/form-status";

import { EVENT_DIALOG_COPY } from "../config/messages";
import { useEventForm } from "../model/use-event-form";
import { EventDetailsFields } from "./event-details-fields";
import { EventNameField } from "./event-name-field";

const COPY = EVENT_DIALOG_COPY.add;

export function NewEventDialogContent({
  dismiss,
  returnFocus,
}: {
  dismiss: () => void;
  returnFocus: ReturnFocus;
}) {
  const eventForm = useEventForm(undefined, dismiss);
  const guard = useDiscardGuard(eventForm.form.dirty, dismiss);

  return (
    <Dialog open onOpenChange={(open) => !open && guard.close()}>
      <DialogContent
        onCloseAutoFocus={returnFocus}
        className="max-w-2xl"
        aria-describedby={undefined}
      >
        <DialogTitleBar
          end={
            <>
              <FormStatus result={eventForm.lastResult} />
              <Button type="submit" form={eventForm.form.id} aria-disabled={eventForm.pending}>
                {eventForm.pending ? COPY.pending : COPY.submit}
              </Button>
            </>
          }
        >
          <EventNameField eventForm={eventForm} title={COPY.title} />
        </DialogTitleBar>
        <DialogBody>
          <form {...eventForm.formProps} className="grid gap-6">
            <EventDetailsFields fields={eventForm.fields} />
          </form>
        </DialogBody>
      </DialogContent>
      <DiscardChangesDialog
        open={guard.confirming}
        onKeepEditing={guard.keepEditing}
        onDiscard={guard.discard}
      />
    </Dialog>
  );
}
