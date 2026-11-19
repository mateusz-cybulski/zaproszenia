import { z } from "zod";

// The value of a datetime-local input: a wall-clock time to the minute, without a zone.
export function localDateTime(emptyMessage: string) {
  return z.iso.datetime({
    local: true,
    precision: -1,
    error: (issue) => (issue.input === undefined ? emptyMessage : "Podaj datę i godzinę."),
  });
}
