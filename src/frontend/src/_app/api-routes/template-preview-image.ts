import { parseTemplateId } from "@/entities/template";
import { fetchTemplatePreviewImage } from "@/entities/template/index.server";
import { readTextWithin } from "@/shared/lib/request-body";

type TemplatePreviewContext = { params: Promise<{ id: string }> };

// Fifty fields of at most 2000 characters each fit well within this.
const MAX_BODY_BYTES = 256 * 1024;

// The session lives in the Next cookie, so the editor posts its unsaved fields through here.
export async function postTemplatePreviewImage(
  request: Request,
  { params }: TemplatePreviewContext,
) {
  const templateId = parseTemplateId((await params).id);
  if (templateId === null) {
    return new Response(null, { status: 404 });
  }
  const body = await readTextWithin(request, MAX_BODY_BYTES);
  if (body === null) {
    return new Response(null, { status: 413 });
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
