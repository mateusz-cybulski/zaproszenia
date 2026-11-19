import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";

import type { SenderInput } from "../model/sender";
import { toSenderBody } from "./sender-dto";

export type UpdateSenderResult = "saved" | "invalid" | "unavailable";

export async function updateSender(input: SenderInput): Promise<UpdateSenderResult> {
  const body = JSON.stringify(toSenderBody(input));
  const response = await apiFetchOrNull("/me", { method: "PUT", body });
  if (response?.ok) {
    return "saved";
  }
  return response?.status === 422 ? "invalid" : "unavailable";
}
