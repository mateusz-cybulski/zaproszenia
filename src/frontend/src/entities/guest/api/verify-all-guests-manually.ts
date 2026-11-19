import "server-only";

import { z } from "zod";

import { apiFetchOrNull, parseResponse } from "@/shared/api/index.server";

const verifiedCountSchema = z.object({ verified: z.int() });

export async function verifyAllGuestsManually(): Promise<number | null> {
  const response = await apiFetchOrNull("/guests/verification/manual", {
    method: "POST",
    body: "{}",
  });
  if (!response?.ok) {
    return null;
  }
  return (await parseResponse(response, verifiedCountSchema)).verified;
}
