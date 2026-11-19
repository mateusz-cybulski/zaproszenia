import type { z } from "zod";

import type {
  caseOptionDtoSchema,
  dateFormatOptionDtoSchema,
  placeholderDtoSchema,
} from "../api/editor-options-dto";

// A name a field can contain in braces, e.g. {salutation}, shown by its Polish label.
export type Placeholder = z.output<typeof placeholderDtoSchema>;

export type DateFormatOption = z.output<typeof dateFormatOptionDtoSchema>;

export type CaseOption = z.output<typeof caseOptionDtoSchema>;

export type EditorOptions = {
  placeholders: Placeholder[];
  dateFormats: DateFormatOption[];
  cases: CaseOption[];
};
