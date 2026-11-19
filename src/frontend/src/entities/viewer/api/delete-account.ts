import "server-only";

import { z } from "zod";

import { apiFetchOrNull } from "@/shared/api/index.server";

export type DeleteAccountResult = "deleted" | "account-kept" | "unavailable";

const accountKeptSchema = z.object({ detail: z.object({ code: z.literal("account_kept") }) });

export async function deleteAccount(): Promise<DeleteAccountResult> {
  const response = await apiFetchOrNull("/me", { method: "DELETE" });
  if (response?.ok) {
    return "deleted";
  }
  const body = await response?.json().catch(() => null);
  return accountKeptSchema.safeParse(body).success ? "account-kept" : "unavailable";
}
