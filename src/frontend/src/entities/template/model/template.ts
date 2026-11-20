import type { z } from "zod";

import type { templateDetailDtoSchema, templateDtoSchema } from "../api/template-dto";

export const TEMPLATE_KINDS = ["invitation", "envelope"] as const;

export type TemplateKind = (typeof TEMPLATE_KINDS)[number];

export type Template = z.output<typeof templateDtoSchema>;

export type TemplatePage = Template["pages"][number];

export type TemplateDetail = z.output<typeof templateDetailDtoSchema>;
