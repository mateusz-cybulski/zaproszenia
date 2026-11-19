export type SaveGuestFailure = { ok: false; reason: "not-found" | "invalid" | "unavailable" };

export type SaveGuestResult = { ok: true } | SaveGuestFailure;

// The saved guest is not read back: a body the client does not expect must not fail a write
// that already happened.
export function toSaveResult(response: Response | null): SaveGuestResult {
  if (response?.ok) {
    return { ok: true };
  }
  if (response?.status === 404) {
    return { ok: false, reason: "not-found" };
  }
  if (response?.status === 422) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: false, reason: "unavailable" };
}
