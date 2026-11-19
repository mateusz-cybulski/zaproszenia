import { z } from "zod";

import { recordIdParamSchema, recordIdSchema } from "@/shared/lib/record-id";

export const guestIdSchema = recordIdSchema.brand<"GuestId">();

export type GuestId = z.output<typeof guestIdSchema>;

// The only way to get a GuestId from outside: an id from the client is checked, never cast.
export function isGuestId(value: unknown): value is GuestId {
  return guestIdSchema.safeParse(value).success;
}

export function parseGuestId(param: string): GuestId | null {
  const parsed = recordIdParamSchema.pipe(guestIdSchema).safeParse(param);
  return parsed.success ? parsed.data : null;
}
