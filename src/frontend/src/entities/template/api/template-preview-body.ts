import type { TemplateField } from "../model/template-field";
import { toTemplateFieldBody } from "./template-field-dto";

// The body the browser posts for a live preview of unsaved fields.
export function templatePreviewBody(fields: TemplateField[], page: number): string {
  return JSON.stringify({ fields: fields.map(toTemplateFieldBody), page });
}
