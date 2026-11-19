"use client";

import { type EditorOptions, TEMPLATE_KIND_LABELS, type TemplateDetail } from "@/entities/template";
import { type Dismissal, useDismiss } from "@/shared/lib/dialogs";
import { routes } from "@/shared/routes";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { EDITOR_COPY } from "../config/field-presets";
import { TemplateEditor } from "./template-editor";

type TemplateEditorDialogProps = {
  template: TemplateDetail;
  options: EditorOptions;
  dismissal: Dismissal;
};

export function TemplateEditorDialog({ template, options, dismissal }: TemplateEditorDialogProps) {
  const dismiss = useDismiss(dismissal, routes.templates());

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-6xl">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2">
            {template.name}
            <Badge variant="outline">{TEMPLATE_KIND_LABELS[template.kind]}</Badge>
            {template.isSystem && <Badge variant="secondary">Systemowy</Badge>}
          </DialogTitle>
          <DialogDescription>
            Pola z danymi gości i wydarzenia, ułożone na stronach szablonu.
          </DialogDescription>
        </DialogHeader>
        {template.isSystem && (
          <Alert>
            <AlertTitle>{EDITOR_COPY.readOnly}</AlertTitle>
            <AlertDescription>{EDITOR_COPY.readOnlyDescription}</AlertDescription>
          </Alert>
        )}
        <TemplateEditor template={template} options={options} />
      </DialogContent>
    </Dialog>
  );
}
