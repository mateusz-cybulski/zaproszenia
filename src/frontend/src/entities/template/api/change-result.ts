import type { Template } from "../model/template";
import { type TemplateDto, toTemplate } from "./template-dto";

export type TemplateChangeFailure = {
  ok: false;
  reason: "not-found" | "read-only" | "invalid" | "too-large" | "unavailable";
  detail?: string;
};

export type TemplateChangeResult = { ok: true; template: Template } | TemplateChangeFailure;

async function apiDetail(response: Response): Promise<string | undefined> {
  const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
  return typeof body?.detail === "string" ? body.detail : undefined;
}

export async function toChangeResult(response: Response | null): Promise<TemplateChangeResult> {
  if (response?.ok) {
    return { ok: true, template: toTemplate((await response.json()) as TemplateDto) };
  }
  switch (response?.status) {
    case 404:
      return { ok: false, reason: "not-found" };
    case 403:
      return { ok: false, reason: "read-only" };
    case 413:
      return { ok: false, reason: "too-large" };
    case 422:
      return { ok: false, reason: "invalid", detail: await apiDetail(response) };
    default:
      return { ok: false, reason: "unavailable" };
  }
}
