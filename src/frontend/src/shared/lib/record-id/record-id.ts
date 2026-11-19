import { z } from "zod";

// Entities brand this per model (z.brand<"GuestId">), so ids of different records cannot mix.
export const recordIdSchema = z.int().positive();

// An id from a URL segment: digits only, since z.coerce.number() would also take "0x10" or "1e3".
export const recordIdParamSchema = z.string().regex(z.regexes.integer).transform(Number);
