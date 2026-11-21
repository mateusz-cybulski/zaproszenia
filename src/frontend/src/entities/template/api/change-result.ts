import { z } from "zod";

const errorDetailSchema = z.object({ detail: z.string() });

export type TemplateChangeFailure = {
  ok: false;
  reason: "not-found" | "read-only" | "invalid" | "too-large" | "unavailable";
  detail?: string;
};

export type TemplateChangeResult = { ok: true } | TemplateChangeFailure;

async function apiDetail(response: Response): Promise<string | undefined> {
  const body = errorDetailSchema.safeParse(await response.json().catch(() => null));
  return body.success ? body.data.detail : undefined;
}

export async function toChangeResult(response: Response | null): Promise<TemplateChangeResult> {
  if (response?.ok) {
    return { ok: true };
  }
  switch (response?.status) {
    case 404:
      return { ok: false, reason: "not-found" };
    case 403:
      return { ok: false, reason: "read-only" };
    case 413:
      return { ok: false, reason: "too-large" };
    case 409:
    case 422:
      return { ok: false, reason: "invalid", detail: await apiDetail(response) };
    default:
      return { ok: false, reason: "unavailable" };
  }
}
