"use client";

import { useEffect, useRef, useState } from "react";

import type { Event, EventDocumentKind, EventGuest, EventReadiness } from "@/entities/event";
import type { Template } from "@/entities/template";
import type { Page } from "@/shared/api";
import { type ReturnFocus, useDiscardGuard } from "@/shared/lib/dialogs";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitleBar } from "@/shared/ui/dialog";
import { DiscardChangesDialog } from "@/shared/ui/discard-changes-dialog";
import { FormStatus } from "@/shared/ui/form-status";

import { EVENT_DIALOG_COPY } from "../config/messages";
import type { EventSection } from "../model/event-section";
import { useEventDocument } from "../model/use-event-document";
import { useEventForm } from "../model/use-event-form";
import { useEventSections } from "../model/use-event-sections";
import { EventDocumentMenu } from "./event-document-menu";
import { EventDocumentConfirmDialog } from "./event-document-confirm-dialog";
import { EventNameField } from "./event-name-field";
import { EventSectionSwitcher } from "./event-section-switcher";
import { EventSections } from "./event-sections";
import { UnsavedBeforeGenerateDialog } from "./unsaved-before-generate-dialog";

const COPY = EVENT_DIALOG_COPY.edit;

type ExistingEventDialogContentProps = {
  event: Event;
  templates: Template[];
  eventGuests: Page<EventGuest>;
  readiness: EventReadiness | null;
  initialSection: EventSection;
  dismiss: () => void;
  returnFocus: ReturnFocus;
};

export function ExistingEventDialogContent({
  event,
  templates,
  eventGuests,
  readiness,
  initialSection,
  dismiss,
  returnFocus,
}: ExistingEventDialogContentProps) {
  const documents = useEventDocument(event);
  // A save keeps the dialog open ("Zapisano." in the header); "Zapisz i generuj" also generates.
  const generateAfterSave = useRef<EventDocumentKind | null>(null);
  const eventForm = useEventForm(event, () => {
    const kind = generateAfterSave.current;
    generateAfterSave.current = null;
    if (kind) {
      void documents.generate(kind);
    }
  });
  const dirty = eventForm.form.dirty;
  const guard = useDiscardGuard(dirty, dismiss);
  const sections = useEventSections(initialSection);
  const [unsavedKind, setUnsavedKind] = useState<EventDocumentKind | null>(null);
  const saveFailed =
    eventForm.lastResult?.status === "error" || Object.keys(eventForm.form.allErrors).length > 0;

  useEffect(() => {
    if (saveFailed) {
      generateAfterSave.current = null;
    }
  }, [saveFailed]);

  function generate(kind: EventDocumentKind) {
    if (dirty) {
      setUnsavedKind(kind);
    } else {
      void documents.generate(kind);
    }
  }

  function saveAndGenerate() {
    generateAfterSave.current = unsavedKind;
    setUnsavedKind(null);
    const form = document.getElementById(eventForm.form.id);
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
  }

  const saving = eventForm.pending;

  return (
    <Dialog open onOpenChange={(open) => !open && guard.close()}>
      <DialogContent
        onCloseAutoFocus={returnFocus}
        className="max-w-4xl"
        aria-describedby={undefined}
      >
        <DialogTitleBar
          start={
            <EventSectionSwitcher section={sections.section} onChange={sections.changeSection} />
          }
          end={
            <>
              <p role="alert" className="max-w-48 text-xs text-destructive empty:hidden">
                {documents.error}
              </p>
              <FormStatus result={eventForm.lastResult} successMessage={COPY.saved} />
              <EventDocumentMenu pending={documents.pending} busy={saving} onGenerate={generate} />
              <Button type="submit" form={eventForm.form.id} aria-disabled={saving}>
                {saving ? COPY.pending : COPY.submit}
              </Button>
            </>
          }
        >
          <EventNameField eventForm={eventForm} title={event.name} />
        </DialogTitleBar>
        <EventSections
          event={event}
          templates={templates}
          eventGuests={eventGuests}
          readiness={readiness}
          sections={sections}
          eventForm={eventForm}
        />
        <UnsavedBeforeGenerateDialog
          open={unsavedKind !== null}
          onSaveAndGenerate={saveAndGenerate}
          onGenerate={() => {
            if (unsavedKind) {
              void documents.generate(unsavedKind);
            }
            setUnsavedKind(null);
          }}
          onCancel={() => setUnsavedKind(null)}
        />
        <EventDocumentConfirmDialog
          problem={documents.confirmation?.problem ?? null}
          onCancel={documents.cancel}
          onConfirm={() =>
            documents.confirmation && void documents.generate(documents.confirmation.kind, true)
          }
        />
      </DialogContent>
      <DiscardChangesDialog
        open={guard.confirming}
        onKeepEditing={guard.keepEditing}
        onDiscard={guard.discard}
      />
    </Dialog>
  );
}
