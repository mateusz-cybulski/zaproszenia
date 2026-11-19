import { parseTemplateId } from "@/entities/template";
import { type TemplateAsset, fetchTemplateAsset } from "@/entities/template/index.server";

type TemplateAssetContext = { params: Promise<{ id: string }> };

// The page image never changes: a template's PDF cannot be replaced, only uploaded anew.
const CACHE_CONTROL: Record<TemplateAsset, string> = {
  "page.png": "private, max-age=31536000, immutable",
  preview: "private, no-store",
};

async function proxyAsset(asset: TemplateAsset, { params }: TemplateAssetContext) {
  const templateId = parseTemplateId((await params).id);
  if (templateId === null) {
    return new Response(null, { status: 404 });
  }
  const response = await fetchTemplateAsset(templateId, asset);
  if (!response.ok) {
    return new Response(null, { status: response.status });
  }
  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": CACHE_CONTROL[asset],
    },
  });
}

export function getTemplatePageImage(_request: Request, context: TemplateAssetContext) {
  return proxyAsset("page.png", context);
}

export function getTemplatePreview(_request: Request, context: TemplateAssetContext) {
  return proxyAsset("preview", context);
}
