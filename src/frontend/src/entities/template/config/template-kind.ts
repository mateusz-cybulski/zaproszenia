import type { TemplateKind } from "../model/template";

export const templateKinds: TemplateKind[] = ["invitation", "envelope"];

export const templateKindLabels: Record<TemplateKind, string> = {
  invitation: "Zaproszenie",
  envelope: "Koperta",
};
