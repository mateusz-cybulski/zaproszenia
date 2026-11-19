import type { Template, TemplateKind } from "@/entities/template";

export function templateOptions(templates: Template[], kind: TemplateKind) {
  return [
    { value: "", label: "Brak" },
    ...templates
      .filter((template) => template.kind === kind)
      .map((template) => ({
        value: String(template.id),
        label: template.isSystem ? `${template.name} (systemowy)` : template.name,
      })),
  ];
}
