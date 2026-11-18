export function parseGuestId(id: string): number | null {
  const guestId = Number(id);
  return Number.isSafeInteger(guestId) && guestId > 0 ? guestId : null;
}
