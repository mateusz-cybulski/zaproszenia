import "server-only";

import { unstable_rethrow } from "next/navigation";

import { apiFetch } from "./api-fetch";

// For mutations that report failures instead of throwing: null means the API is unreachable.
export async function apiFetchOrNull(
  path: string,
  init?: Parameters<typeof apiFetch>[1],
): Promise<Response | null> {
  try {
    return await apiFetch(path, init);
  } catch (error) {
    // An expired session redirects to sign-in; only network failures become null.
    unstable_rethrow(error);
    return null;
  }
}
