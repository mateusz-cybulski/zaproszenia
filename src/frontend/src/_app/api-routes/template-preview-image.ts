import { parseTemplateId } from "@/entities/template";
import { fetchTemplatePreviewImage } from "@/entities/template/index.server";

type TemplatePreviewContext = { params: Promise<{ id: string }> };

// Fifty fields of at most 2000 characters each fit well within this.
const MAX_BODY_BYTES = 256 * 1024;

// The session lives in the Next cookie, so the editor posts its unsaved fields through here.
export async function postTemplatePreviewImage(
  request: Request,
  { params }: TemplatePreviewContext,
) {
  const templateId = parseTemplateId((await params).id);
  const body = await request.text();
  if (templateId === null || body.length > MAX_BODY_BYTES) {
    return new Response(null, { status: templateId === null ? 404 : 413 });
  }
  const response = await fetchTemplatePreviewImage(templateId, body);
  if (!response.ok) {
    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "text/plain" },
    });
  }
  return new Response(response.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
  });
}
