import { z } from "zod";

export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Maksymalnie ${max} znaków.`)
    .transform((value) => value || null);
}
