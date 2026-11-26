import "server-only";

import { z } from "zod";

import { apiFetchOrNull, parseResponse } from "@/shared/api/index.server";

import type { GuestImportResult } from "../model/guest-import";
import { guestImportResultSchema } from "./guest-import-dto";

const detailSchema = z.object({ detail: z.string() });

export type GuestImportOutcome =
  { ok: true; result: GuestImportResult } | { ok: false; reason: string | null };

// dryRun only checks the file; otherwise the valid, new rows are saved. reason: the API's message
// for a file it cannot read (Polish), or null when the API could not be reached.
export async function importGuests(file: File, dryRun: boolean): Promise<GuestImportOutcome> {
  const body = new FormData();
  body.set("file", file);
  const response = await apiFetchOrNull(`/guests/import?dry_run=${dryRun}`, {
    method: "POST",
    body,
  });
  if (!response) {
    return { ok: false, reason: null };
  }
  if (!response.ok) {
    const detail = detailSchema.safeParse(await response.json().catch(() => null));
    return { ok: false, reason: detail.success ? detail.data.detail : null };
  }
  return { ok: true, result: await parseResponse(response, guestImportResultSchema) };
}
