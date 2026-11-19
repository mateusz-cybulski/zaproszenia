// A page number from the URL; anything but a positive whole number is the first page.
export function parsePage(value: string | string[] | undefined): number {
  const page = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : 1;
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
