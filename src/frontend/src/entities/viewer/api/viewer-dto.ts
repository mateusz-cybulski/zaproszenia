import { z } from "zod";

export const viewerDtoSchema = z.object({
  uid: z.string(),
  email: z.string().nullable(),
});
