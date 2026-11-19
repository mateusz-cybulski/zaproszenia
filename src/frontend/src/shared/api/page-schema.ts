import { z } from "zod";

// The API's paged list: one page of items and how many there are in all.
export function pageSchema<Item extends z.ZodType>(item: Item) {
  return z
    .object({
      items: z.array(item),
      total: z.int().nonnegative(),
      page: z.int().positive(),
      page_size: z.int().positive(),
    })
    .transform((dto) => ({
      items: dto.items,
      total: dto.total,
      page: dto.page,
      pageSize: dto.page_size,
    }));
}

export type Page<Item> = { items: Item[]; total: number; page: number; pageSize: number };
