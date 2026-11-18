export type TemplateKind = "invitation" | "envelope";

export type TemplatePage = { widthMm: number; heightMm: number };

export type Template = {
  id: number;
  kind: TemplateKind;
  name: string;
  isSystem: boolean;
  hasFile: boolean;
  pages: TemplatePage[];
  fieldCount: number;
  updatedAt: string;
};
