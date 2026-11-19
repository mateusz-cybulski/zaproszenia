import "server-only";

import { z } from "zod";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { EditorOptions } from "../model/placeholder";
import {
  caseOptionDtoSchema,
  dateFormatOptionDtoSchema,
  placeholderDtoSchema,
} from "./editor-options-dto";

async function getList<Item extends z.ZodType>(
  path: string,
  item: Item,
): Promise<z.output<Item>[]> {
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }
  return parseResponse(response, z.array(item));
}

// What the field editor offers: the placeholders, the date formats and the grammatical cases.
export async function getEditorOptions(): Promise<EditorOptions> {
  const [placeholders, dateFormats, cases] = await Promise.all([
    getList("/templates/placeholders", placeholderDtoSchema),
    getList("/templates/date-formats", dateFormatOptionDtoSchema),
    getList("/templates/cases", caseOptionDtoSchema),
  ]);
  return { placeholders, dateFormats, cases };
}
