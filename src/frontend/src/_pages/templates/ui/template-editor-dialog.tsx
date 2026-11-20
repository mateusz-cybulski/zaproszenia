"use client";

import { TriangleAlert } from "lucide-react";
import { useState } from "react";

import { type EditorOptions, TEMPLATE_KIND_LABELS, type TemplateDetail } from "@/entities/template";
import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

import { EDITOR_COPY } from "../config/field-presets";
import { SAVE_COPY } from "../config/save-copy";
import { useCopyAndEdit } from "../model/use-copy-and-edit";
import { useSaveTemplate } from "../model/use-save-template";
import { useTemplateEditor } from "../model/use-template-editor";
import { useUnsavedChangesWarning } from "../model/use-unsaved-changes-warning";
import { CopyAndEditButton } from "./copy-and-edit-button";
import { DiscardChangesDialog } from "./discard-changes-dialog";
import { SaveTemplateButton } from "./save-template-button";
import { TemplateEditor } from "./template-editor";
import { TemplateNameField } from "./template-name-field";
import { TemplatePageSwitcher } from "./template-page-switcher";

type TemplateEditorDialogProps = {
  template: TemplateDetail;
  options: EditorOptions;
  dismissal: Dismissal;
};

export function TemplateEditorDialog({ template, options, dismissal }: TemplateEditorDialogProps) {
  const dismiss = useDismiss(dismissal, routes.templates());
  const editor = useTemplateEditor(template, options);
  const saving = useSaveTemplate(template.id, editor.markSaved);
  const copying = useCopyAndEdit(template.id);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  useUnsavedChangesWarning(editor.dirty);
  const error = saving.error ?? copying.error;

  function close() {
    if (editor.dirty) {
      setConfirmingDiscard(true);
    } else {
      dismiss();
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-6xl" aria-describedby={undefined}>
        <DialogHeader className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3.5">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{TEMPLATE_KIND_LABELS[template.kind]}</Badge>
            {template.isSystem && <Badge variant="secondary">Systemowy</Badge>}
            <TemplatePageSwitcher
              pages={template.pages}
              pageIndex={editor.pageIndex}
              onShowPage={editor.showPage}
            />
          </div>
          {template.isSystem ? (
            <DialogTitle className="text-center">{template.name}</DialogTitle>
          ) : (
            <div>
              <DialogTitle className="sr-only">{editor.name.trim() || template.name}</DialogTitle>
              <TemplateNameField name={editor.name} onChange={editor.rename} />
            </div>
          )}
          <div className="justify-self-end">
            {template.isSystem ? (
              <CopyAndEditButton pending={copying.pending} onCopy={copying.copy} />
            ) : (
              <SaveTemplateButton
                dirty={editor.dirty}
                pending={saving.pending}
                savedOnce={saving.savedOnce}
                emptyFieldCount={editor.emptyFieldCount}
                nameEmpty={editor.name.trim() === ""}
                onSave={() => saving.save(editor.draft)}
              />
            )}
          </div>
        </DialogHeader>
        <DialogBody>
          {template.isSystem && (
            <Alert>
              <AlertTitle>{EDITOR_COPY.readOnly}</AlertTitle>
              <AlertDescription>{EDITOR_COPY.readOnlyDescription}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>{SAVE_COPY.saveFailed}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <TemplateEditor template={template} options={options} editor={editor} />
        </DialogBody>
      </DialogContent>
      <DiscardChangesDialog
        open={confirmingDiscard}
        onKeepEditing={() => setConfirmingDiscard(false)}
        onDiscard={dismiss}
      />
    </Dialog>
  );
}
