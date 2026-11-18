import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

export type DeleteAccountResult = "deleted" | "account-kept" | "unavailable";

const ACCOUNT_KEPT = "account_kept";

export async function deleteAccount(): Promise<DeleteAccountResult> {
  const response = await apiFetchOrNull("/me", { method: "DELETE" });
  if (response?.ok) {
    return "deleted";
  }
  const body = (await response?.json().catch(() => null)) as { detail?: { code?: string } } | null;
  return body?.detail?.code === ACCOUNT_KEPT ? "account-kept" : "unavailable";
}
