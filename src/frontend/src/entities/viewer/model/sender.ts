import type { z } from "zod";

import type { senderDtoSchema } from "../api/sender-dto";

export type SenderInput = {
  senderName: string | null;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
};

export type Sender = z.output<typeof senderDtoSchema>;
