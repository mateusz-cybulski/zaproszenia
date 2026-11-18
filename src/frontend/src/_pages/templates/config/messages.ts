import type { TemplateChangeFailure } from "@/entities/template/index.server";

import { MAX_PDF_MEGABYTES } from "./upload";

export const NOT_FOUND = "Ten szablon już nie istnieje.";
export const FILE_TOO_LARGE = `Plik jest za duży (najwyżej ${MAX_PDF_MEGABYTES} MB).`;
export const DELETE_FAILED = "Nie udało się usunąć szablonu. Spróbuj ponownie.";

export const failureMessages: Record<TemplateChangeFailure["reason"], string> = {
  "not-found": NOT_FOUND,
  "read-only": "Szablonów systemowych nie można zmieniać. Zrób kopię.",
  invalid: "API odrzuciło plik.",
  "too-large": FILE_TOO_LARGE,
  unavailable: "Nie udało się połączyć z API. Spróbuj ponownie.",
};
