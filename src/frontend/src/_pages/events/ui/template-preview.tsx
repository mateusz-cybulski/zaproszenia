import type { Template } from "@/entities/template";
import { routes } from "@/shared/routes";
import { PagePreview } from "@/shared/ui/page-preview";

import { EVENT_SECTION_COPY } from "../config/messages";

type TemplatePreviewProps = { eventId: number; template: Template | undefined };

export function TemplatePreview({ eventId, template }: TemplatePreviewProps) {
  if (!template) {
    return <p className="text-sm text-muted-foreground">{EVENT_SECTION_COPY.noTemplate}</p>;
  }
  return (
    <div className="grid gap-3">
      {template.pages.map((page, index) => (
        <PagePreview
          key={`${template.id}-${index}`}
          src={routes.eventPreviewImage(eventId, template.id, index)}
          alt={`${template.name}: strona ${index + 1} z ${template.pages.length}`}
          widthMm={page.widthMm}
          heightMm={page.heightMm}
        />
      ))}
    </div>
  );
}
