import { z } from "zod";

const recordIdSchema = z.int().positive();
// Digits only: z.coerce.number() would also take "0x10", "1e3" or " 5".
const recordIdParamSchema = z
  .string()
  .regex(z.regexes.integer)
  .transform(Number)
  .pipe(recordIdSchema);

// An id from the client goes into an API path: anything but a positive integer is rejected.
export function isRecordId(value: unknown): value is number {
  return recordIdSchema.safeParse(value).success;
}

export function parseRecordId(param: string): number | null {
  const parsed = recordIdParamSchema.safeParse(param);
  return parsed.success ? parsed.data : null;
}
