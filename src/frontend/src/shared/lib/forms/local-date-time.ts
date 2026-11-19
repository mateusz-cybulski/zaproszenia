import { z } from "zod";

// The value of a datetime-local input: a wall-clock time without a zone.
export function localDateTime(emptyMessage: string) {
  return z
    .string()
    .trim()
    .min(1, emptyMessage)
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Podaj datę i godzinę.");
}
