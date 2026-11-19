import type { z } from "zod";

import type { templateDtoSchema } from "../api/template-dto";

export const TEMPLATE_KINDS = ["invitation", "envelope"] as const;

export type TemplateKind = (typeof TEMPLATE_KINDS)[number];

export type Template = z.output<typeof templateDtoSchema>;

export type TemplatePage = Template["pages"][number];
