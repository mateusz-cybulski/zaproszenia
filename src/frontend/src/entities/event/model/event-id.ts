import { z } from "zod";

import { recordIdParamSchema, recordIdSchema } from "@/shared/lib/record-id";

export const eventIdSchema = recordIdSchema.brand<"EventId">();

export type EventId = z.output<typeof eventIdSchema>;

// The only way to get a EventId from outside: an id from the client is checked, never cast.
export function isEventId(value: unknown): value is EventId {
  return eventIdSchema.safeParse(value).success;
}

export function parseEventId(param: string): EventId | null {
  const parsed = recordIdParamSchema.pipe(eventIdSchema).safeParse(param);
  return parsed.success ? parsed.data : null;
}
