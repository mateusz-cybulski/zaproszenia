import "server-only";

import type { TemplateId } from "@/entities/template/@x/event";
import { apiFetch } from "@/shared/api/index.server";

import type { EventId } from "../model/event-id";

export function fetchEventPreview(
  id: EventId,
  templateId: TemplateId,
  page: number,
): Promise<Response> {
  const query = new URLSearchParams({ template_id: String(templateId), page: String(page) });
  return apiFetch(`/events/${id}/preview.png?${query}`, { onUnauthorized: "return" });
}
