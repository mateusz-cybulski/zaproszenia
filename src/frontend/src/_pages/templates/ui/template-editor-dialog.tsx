"use client";

import { TriangleAlert } from "lucide-react";
import { useId, useState } from "react";

import { type EditorOptions, TEMPLATE_KIND_LABELS, type TemplateDetail } from "@/entities/template";
import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Dialog, DialogBody, DialogContent, DialogTitle, DialogTitleBar } from "@/shared/ui/dialog";
import { DialogNameField } from "@/shared/ui/dialog-name-field";

import { EDITOR_COPY } from "../config/field-presets";
import { SAVE_COPY } from "../config/save-copy";
import { MAX_NAME_LENGTH } from "../config/upload";
import { useCopyAndEdit } from "../model/use-copy-and-edit";
import { useSaveTemplate } from "../model/use-save-template";
import { useTemplateEditor } from "../model/use-template-editor";
import { useUnsavedChangesWarning } from "../model/use-unsaved-changes-warning";
import { CopyAndEditButton } from "./copy-and-edit-button";
import { DiscardChangesDialog } from "./discard-changes-dialog";
import { SaveTemplateButton } from "./save-template-button";
import { TemplateEditor } from "./template-editor";
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
  const nameEmpty = editor.name.trim() === "";
  const nameErrorId = useId();

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
        <DialogTitleBar
          start={
            <>
              <Badge variant="outline">{TEMPLATE_KIND_LABELS[template.kind]}</Badge>
              {template.isSystem && <Badge variant="secondary">Systemowy</Badge>}
              <TemplatePageSwitcher
                pages={template.pages}
                pageIndex={editor.pageIndex}
                onShowPage={editor.showPage}
              />
            </>
          }
          end={
            template.isSystem ? (
              <CopyAndEditButton pending={copying.pending} onCopy={copying.copy} />
            ) : (
              <SaveTemplateButton
                dirty={editor.dirty}
                pending={saving.pending}
                savedOnce={saving.savedOnce}
                emptyFieldCount={editor.emptyFieldCount}
                nameEmpty={nameEmpty}
                onSave={() => saving.save(editor.draft)}
              />
            )
          }
        >
          {template.isSystem ? (
            <DialogTitle className="text-center">{template.name}</DialogTitle>
          ) : (
            <DialogNameField
              label={SAVE_COPY.name}
              title={editor.name.trim() || template.name}
              value={editor.name}
              maxLength={MAX_NAME_LENGTH}
              error={nameEmpty ? SAVE_COPY.nameEmpty : undefined}
              errorId={nameErrorId}
              onChange={(event) => editor.rename(event.target.value)}
            />
          )}
        </DialogTitleBar>
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
