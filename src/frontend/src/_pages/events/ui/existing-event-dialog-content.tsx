"use client";

import { useEffect, useState } from "react";

import type { Event, EventDocumentKind, EventGuest } from "@/entities/event";
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
import { type EventDialogForm, useSaveForms } from "../model/use-save-forms";
import { useTemplateChoiceForm } from "../model/use-template-choice-form";
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
  initialSection: EventSection;
  dismiss: () => void;
  returnFocus: ReturnFocus;
};

function submitForm(id: string) {
  const form = document.getElementById(id);
  if (form instanceof HTMLFormElement) {
    form.requestSubmit();
  }
}

export function ExistingEventDialogContent({
  event,
  templates,
  eventGuests,
  initialSection,
  dismiss,
  returnFocus,
}: ExistingEventDialogContentProps) {
  const documents = useEventDocument(event);
  const batch = useSaveForms();
  const eventForm = useEventForm(event, () => batch.saved("details") || dismiss());
  const templateForm = useTemplateChoiceForm(event, () => batch.saved("templates"));
  const guard = useDiscardGuard(eventForm.form.dirty || templateForm.form.dirty, dismiss);
  const sections = useEventSections(initialSection);
  const [unsavedKind, setUnsavedKind] = useState<EventDocumentKind | null>(null);

  const forms = { details: eventForm, templates: templateForm };
  const unsaved = (Object.keys(forms) as EventDialogForm[]).filter(
    (name) => forms[name].form.dirty,
  );
  const saveFailed = Object.values(forms).some(
    (state) => state.lastResult?.status === "error" || Object.keys(state.form.allErrors).length > 0,
  );

  useEffect(() => {
    if (saveFailed) {
      batch.cancel();
    }
  }, [saveFailed, batch]);

  function saveForms(names: EventDialogForm[], then: () => void) {
    batch.start(names, then);
    names.forEach((name) => submitForm(forms[name].form.id));
  }

  // "Zapisz" saves whatever changed, the details when nothing did, then closes the dialog.
  function save() {
    saveForms(unsaved.length > 0 ? unsaved : ["details"], dismiss);
  }

  function generate(kind: EventDocumentKind) {
    if (unsaved.length > 0) {
      setUnsavedKind(kind);
    } else {
      void documents.generate(kind);
    }
  }

  function saveAndGenerate() {
    if (!unsavedKind) {
      return;
    }
    const kind = unsavedKind;
    setUnsavedKind(null);
    saveForms(unsaved, () => void documents.generate(kind));
  }

  const pending = eventForm.pending || templateForm.pending;

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
              <FormStatus result={eventForm.lastResult} />
              <FormStatus result={templateForm.lastResult} />
              <EventDocumentMenu
                pending={documents.pending}
                busy={batch.saving}
                onGenerate={generate}
              />
              {/* The details form's submit button, so Enter in a field presses it too; it saves
                every form with changes, not only the details. */}
              <Button
                type="submit"
                form={eventForm.form.id}
                aria-disabled={pending || batch.saving}
                onClick={(clickEvent) => {
                  clickEvent.preventDefault();
                  save();
                }}
              >
                {pending ? COPY.pending : COPY.submit}
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
          sections={sections}
          eventForm={eventForm}
          templateForm={templateForm}
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
