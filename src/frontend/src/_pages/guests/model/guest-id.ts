export function parseGuestId(id: string): number | null {
  const guestId = Number(id);
  return Number.isSafeInteger(guestId) && guestId > 0 ? guestId : null;
}

export function isGuestId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
