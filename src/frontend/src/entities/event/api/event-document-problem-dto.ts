import { z } from "zod";

// The API's 409 detail when it did not generate a document.
export const eventDocumentProblemDtoSchema = z
  .object({
    code: z.enum(["no_guests", "no_template", "needs_confirmation"]),
    unverified: z.int(),
    sender_incomplete: z.boolean(),
  })
  .transform((dto) => ({
    code: dto.code,
    unverified: dto.unverified,
    senderIncomplete: dto.sender_incomplete,
  }));

export const eventDocumentErrorSchema = z.object({ detail: eventDocumentProblemDtoSchema });
