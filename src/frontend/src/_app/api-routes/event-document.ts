import { z } from "zod";

import { parseEventId } from "@/entities/event";
import { generateEventDocument } from "@/entities/event/index.server";
import { TEMPLATE_KINDS } from "@/entities/template";
import { readTextWithin } from "@/shared/lib/request-body";

type EventDocumentContext = { params: Promise<{ id: string; kind: string }> };

const MAX_BODY_BYTES = 1024;
const kindSchema = z.enum(TEMPLATE_KINDS);
const bodySchema = z.object({ confirmed: z.boolean().default(false) });

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// The session lives in the Next cookie, so the browser generates documents through this proxy.
export async function postEventDocument(request: Request, { params }: EventDocumentContext) {
  const { id, kind } = await params;
  const eventId = parseEventId(id);
  const documentKind = kindSchema.safeParse(kind);
  if (eventId === null || !documentKind.success) {
    return new Response(null, { status: 404 });
  }
  const text = await readTextWithin(request, MAX_BODY_BYTES);
  if (text === null) {
    return new Response(null, { status: 413 });
  }
  const body = bodySchema.safeParse(parseJson(text || "{}"));
  if (!body.success) {
    return new Response(null, { status: 422 });
  }
  const response = await generateEventDocument(eventId, documentKind.data, body.data.confirmed);
  if (!response.ok) {
    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "text/plain" },
    });
  }
  return new Response(response.body, {
    headers: { "Content-Type": "application/pdf", "Cache-Control": "private, no-store" },
  });
}
