import { notFound } from "next/navigation";

import { parseTemplateId } from "@/entities/template";
import { getEditorOptions, getTemplate } from "@/entities/template/index.server";
import { requireViewer } from "@/entities/viewer/index.server";
import type { Dismissal } from "@/shared/lib/dialogs";

import { TemplateEditorDialog } from "./template-editor-dialog";

type TemplateEditDialogProps = { id: string; dismissal: Dismissal };

export async function TemplateEditDialog({ id, dismissal }: TemplateEditDialogProps) {
  // The layout's session check does not run on link navigation.
  await requireViewer();
  const templateId = parseTemplateId(id);
  if (templateId === null) {
    notFound();
  }
  const [template, options] = await Promise.all([getTemplate(templateId), getEditorOptions()]);
  if (!template) {
    notFound();
  }
  // "Kopiuj i edytuj" opens the copy in this dialog; without the key it would keep the original's state.
  return (
    <TemplateEditorDialog
      key={template.id}
      template={template}
      options={options}
      dismissal={dismissal}
    />
  );
}
