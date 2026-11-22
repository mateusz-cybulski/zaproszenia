"use client";

import { useEffect, useState } from "react";

import type { Event, EventDocumentKind, EventGuest } from "@/entities/event";
import type { Template } from "@/entities/template";
import type { Page } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { DialogTitleBar } from "@/shared/ui/dialog";
import { FormStatus } from "@/shared/ui/form-status";

import { EVENT_DIALOG_COPY } from "../config/messages";
import type { EventSection } from "../model/event-section";
import { useEventDocument } from "../model/use-event-document";
import { useEventForm } from "../model/use-event-form";
import { useEventSections } from "../model/use-event-sections";
import { type EventDialogForm, useSaveThenGenerate } from "../model/use-save-then-generate";
import { useTemplateChoiceForm } from "../model/use-template-choice-form";
import { EventDocumentButtons } from "./event-document-buttons";
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
  onSaved: () => void;
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
  onSaved,
}: ExistingEventDialogContentProps) {
  const documents = useEventDocument(event);
  const saveThenGenerate = useSaveThenGenerate((kind) => void documents.generate(kind));
  // Saving for "Zapisz i generuj" keeps the dialog open; a plain save closes it as before.
  const eventForm = useEventForm(event, () => saveThenGenerate.saved("details") || onSaved());
  const templateForm = useTemplateChoiceForm(event, () => saveThenGenerate.saved("templates"));
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
      saveThenGenerate.cancel();
    }
  }, [saveFailed, saveThenGenerate]);

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
    saveThenGenerate.start(unsavedKind, unsaved);
    setUnsavedKind(null);
    unsaved.forEach((name) => submitForm(forms[name].form.id));
  }

  return (
    <>
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
            <EventDocumentButtons
              pending={documents.pending}
              busy={saveThenGenerate.waiting}
              onGenerate={generate}
            />
            <Button type="submit" form={eventForm.form.id} aria-disabled={eventForm.pending}>
              {eventForm.pending ? COPY.pending : COPY.submit}
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
    </>
  );
}
