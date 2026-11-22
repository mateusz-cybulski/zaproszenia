"use client";

import { Button } from "@/shared/ui/button";
import { DialogBody, DialogTitleBar } from "@/shared/ui/dialog";
import { FormStatus } from "@/shared/ui/form-status";

import { EVENT_DIALOG_COPY } from "../config/messages";
import { useEventForm } from "../model/use-event-form";
import { EventForm } from "./event-form";
import { EventNameField } from "./event-name-field";

const COPY = EVENT_DIALOG_COPY.add;

export function NewEventDialogContent({ onSaved }: { onSaved: () => void }) {
  const eventForm = useEventForm(undefined, onSaved);

  return (
    <>
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
        <EventForm eventForm={eventForm} />
      </DialogBody>
    </>
  );
}
