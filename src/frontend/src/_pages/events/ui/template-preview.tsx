import type { Template } from "@/entities/template";
import { routes } from "@/shared/routes";

import { EVENT_SECTION_COPY } from "../config/messages";

type TemplatePreviewProps = { eventId: number; template: Template | undefined };

export function TemplatePreview({ eventId, template }: TemplatePreviewProps) {
  if (!template) {
    return <p className="text-sm text-muted-foreground">{EVENT_SECTION_COPY.noTemplate}</p>;
  }
  return (
    <div className="grid gap-3">
      {template.pages.map((_page, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${template.id}-${index}`}
          src={routes.eventPreviewImage(eventId, template.id, index)}
          alt={`${template.name}: strona ${index + 1} z ${template.pages.length}`}
          className="w-full rounded-md border bg-white shadow-sm"
        />
      ))}
    </div>
  );
}
