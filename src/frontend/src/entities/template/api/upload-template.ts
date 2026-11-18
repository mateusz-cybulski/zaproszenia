import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { TemplateKind } from "../model/template";
import { type TemplateChangeResult, toChangeResult } from "./change-result";

export async function uploadTemplate(input: {
  name: string;
  kind: TemplateKind;
  file: File;
}): Promise<TemplateChangeResult> {
  const body = new FormData();
  body.set("name", input.name);
  body.set("kind", input.kind);
  body.set("file", input.file);
  return toChangeResult(await apiFetchOrNull("/templates", { method: "POST", body }));
}
