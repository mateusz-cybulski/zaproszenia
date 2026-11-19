import { z } from "zod";

import { TEMPLATE_KINDS } from "@/entities/template";

import { FILE_TOO_LARGE } from "../config/messages";
import { MAX_NAME_LENGTH, MAX_PDF_BYTES } from "../config/upload";

export function nameFromFile(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "").slice(0, MAX_NAME_LENGTH);
}

export const uploadTemplateSchema = z
  .object({
    name: z.string().trim().max(MAX_NAME_LENGTH, `Maksymalnie ${MAX_NAME_LENGTH} znaków.`),
    kind: z.enum(TEMPLATE_KINDS, "Wybierz rodzaj szablonu."),
    file: z
      .file({ error: "Wybierz plik PDF." })
      .min(1, "Wybierz plik PDF.")
      .max(MAX_PDF_BYTES, FILE_TOO_LARGE),
  })
  .transform((input) => ({ ...input, name: input.name || nameFromFile(input.file.name) }));
