import { parseEventId } from "@/entities/event";
import { fetchEventPreview } from "@/entities/event/index.server";
import { parseTemplateId } from "@/entities/template";
import { recordIdParamSchema } from "@/shared/lib/record-id";

type EventPreviewContext = { params: Promise<{ id: string }> };

// The session lives in the Next cookie, so the browser loads previews through this proxy.
export async function getEventPreview(request: Request, { params }: EventPreviewContext) {
  const query = new URL(request.url).searchParams;
  const eventId = parseEventId((await params).id);
  const templateId = parseTemplateId(query.get("template_id") ?? "");
  const page = recordIdParamSchema.safeParse(query.get("page") ?? "0");
  if (eventId === null || templateId === null || !page.success) {
    return new Response(null, { status: 404 });
  }
  const response = await fetchEventPreview(eventId, templateId, page.data);
  if (!response.ok) {
    return new Response(null, { status: response.status });
  }
  return new Response(response.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
  });
}
