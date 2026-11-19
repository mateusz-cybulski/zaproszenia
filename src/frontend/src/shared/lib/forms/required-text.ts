import { z } from "zod";

export function requiredText(max: number, emptyMessage: string) {
  return z.string().trim().min(1, emptyMessage).max(max, `Maksymalnie ${max} znaków.`);
}
