import { type Template, TemplateCard } from "@/entities/template";

import { TemplateActions } from "./template-actions";

export function TemplateGrid({ templates }: { templates: Template[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
      {templates.map((template) => (
        <li key={template.id} className="grid">
          <TemplateCard template={template} actions={<TemplateActions template={template} />} />
        </li>
      ))}
    </ul>
  );
}
