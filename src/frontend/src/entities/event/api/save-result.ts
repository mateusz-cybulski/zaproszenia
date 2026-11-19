export type SaveEventFailure = { ok: false; reason: "not-found" | "invalid" | "unavailable" };

export type SaveEventResult = { ok: true } | SaveEventFailure;

// The saved event is not read back: a body the client does not expect must not fail a write
// that already happened.
export function toSaveResult(response: Response | null): SaveEventResult {
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
