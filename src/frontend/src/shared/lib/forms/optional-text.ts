import { z } from "zod";

// Conform submits an empty field as undefined; both it and blank text become null.
export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Maksymalnie ${max} znaków.`)
    .optional()
    .transform((value) => value || null);
}
