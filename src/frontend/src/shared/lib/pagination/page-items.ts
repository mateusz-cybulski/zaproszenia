export type PageItem = number | "gap";

// The first, the last and the pages around the current one, with gaps between: 1 … 4 5 6 … 12.
export function pageItems(current: number, pageCount: number): PageItem[] {
  const pages = new Set([1, pageCount, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b);
  const items: PageItem[] = [];
  for (const page of sorted) {
    const previous = items.at(-1);
    if (typeof previous === "number" && page - previous > 1) {
      items.push(page - previous === 2 ? previous + 1 : "gap");
    }
    items.push(page);
  }
  return items;
}
