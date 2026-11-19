import { z } from "zod";

import { guestDtoSchema } from "@/entities/guest/@x/event";
import { apiTimestamp } from "@/shared/api";

import { INVITATION_STATUSES } from "../model/event-guest";

export const eventGuestDtoSchema = z
  .object({
    guest: guestDtoSchema,
    status: z.enum(INVITATION_STATUSES),
    added_at: apiTimestamp,
    generated_at: apiTimestamp.nullable(),
  })
  .transform((dto) => ({
    guest: dto.guest,
    status: dto.status,
    addedAt: dto.added_at,
    generatedAt: dto.generated_at,
  }));
