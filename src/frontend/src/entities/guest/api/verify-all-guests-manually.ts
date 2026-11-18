import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

export async function verifyAllGuestsManually(): Promise<number | null> {
  const response = await apiFetchOrNull("/guests/verification/manual", {
    method: "POST",
    body: "{}",
  });
  if (!response?.ok) {
    return null;
  }
  return ((await response.json()) as { verified: number }).verified;
}
