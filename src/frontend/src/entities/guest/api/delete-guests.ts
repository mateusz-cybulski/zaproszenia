import "server-only";

import { apiFetchOrNull } from "@/shared/api/index.server";
import type { GuestId } from "../model/guest-id";

export async function deleteGuests(ids: GuestId[]): Promise<boolean> {
  const body = JSON.stringify({ guest_ids: ids });
  const response = await apiFetchOrNull("/guests/delete", { method: "POST", body });
  return response?.ok === true;
}
