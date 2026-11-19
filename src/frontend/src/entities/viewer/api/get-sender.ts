import "server-only";

import { apiFetch, parseResponse } from "@/shared/api/index.server";

import type { Sender } from "../model/sender";
import { senderDtoSchema } from "./sender-dto";

export async function getSender(): Promise<Sender> {
  const response = await apiFetch("/me");
  if (!response.ok) {
    throw new Error(`GET /me failed with ${response.status}`);
  }
  return parseResponse(response, senderDtoSchema);
}
