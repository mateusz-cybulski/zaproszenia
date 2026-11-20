import type { z } from "zod";

import type { templateFieldDtoSchema } from "../api/template-field-dto";

export const FONT_NAMES = ["serif", "serif-bold", "serif-italic", "sans", "sans-bold"] as const;
export const ALIGNMENTS = ["left", "center", "right"] as const;
export const DATE_FORMATS = [
  "long",
  "long_plain",
  "weekday_long",
  "numeric",
  "numeric_suffix",
  "roman",
] as const;
export const DECLINABLE_PLACEHOLDERS = [
  "recipient",
  "full_name",
  "position",
  "institution",
] as const;
export const CASES = ["nom", "gen", "dat", "acc", "inst", "loc", "voc"] as const;

export type FontName = (typeof FONT_NAMES)[number];
export type Alignment = (typeof ALIGNMENTS)[number];
export type DateFormat = (typeof DATE_FORMATS)[number];
export type DeclinablePlaceholder = (typeof DECLINABLE_PLACEHOLDERS)[number];
export type GrammaticalCase = (typeof CASES)[number];

// A text box on a template page, in mm from the page's top left corner.
export type TemplateField = z.output<typeof templateFieldDtoSchema>;
