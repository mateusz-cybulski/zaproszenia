import { parseTemplateId } from "@/entities/template";
import { fetchSavedTemplatePreviewImage } from "@/entities/template/index.server";

type SavedTemplatePreviewContext = { params: Promise<{ id: string }> };

// The URL carries the template's updated_at, so a saved change gets a new URL and the cache
// may keep the image; a day bounds how long a deploy that changes the sample data shows old ones.
const CACHE_CONTROL = "private, max-age=86400";

export async function getSavedTemplatePreviewImage(
  _request: Request,
  { params }: SavedTemplatePreviewContext,
) {
  const templateId = parseTemplateId((await params).id);
  if (templateId === null) {
    return new Response(null, { status: 404 });
  }
  const response = await fetchSavedTemplatePreviewImage(templateId);
  if (!response.ok) {
    return new Response(null, { status: response.status });
  }
  return new Response(response.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": CACHE_CONTROL },
  });
}
