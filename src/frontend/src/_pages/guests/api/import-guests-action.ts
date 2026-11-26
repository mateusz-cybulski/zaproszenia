"use server";

import { revalidatePath } from "next/cache";

import type { GuestImportResult } from "@/entities/guest";
import { importGuests } from "@/entities/guest/index.server";
import { routes } from "@/shared/routes";

import { hasImportExtension, IMPORT_COPY, IMPORT_MAX_BYTES } from "../config/import-copy";

type ImportGuestsResult = { result: GuestImportResult; error?: undefined } | { error: string };

export async function importGuestsAction(
  formData: FormData,
  dryRun: boolean,
): Promise<ImportGuestsResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: IMPORT_COPY.noFile };
  }
  if (!hasImportExtension(file.name)) {
    return { error: IMPORT_COPY.wrongType };
  }
  if (file.size > IMPORT_MAX_BYTES) {
    return { error: IMPORT_COPY.tooLarge };
  }
  const outcome = await importGuests(file, dryRun === true);
  if (!outcome.ok) {
    return { error: outcome.reason ?? IMPORT_COPY.failed };
  }
  if (!dryRun) {
    revalidatePath(routes.guests(), "layout");
  }
  return { result: outcome.result };
}
