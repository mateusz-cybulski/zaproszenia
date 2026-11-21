import type { z } from "zod";

import type { TemplateKind } from "@/entities/template/@x/event";

import type { eventDocumentProblemDtoSchema } from "../api/event-document-problem-dto";

// Invitations or envelopes for every guest on an event's list, as one PDF.
export type EventDocumentKind = TemplateKind;

export type EventDocumentProblem = z.output<typeof eventDocumentProblemDtoSchema>;
