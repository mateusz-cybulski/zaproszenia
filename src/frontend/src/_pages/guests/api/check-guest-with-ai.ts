import { z } from "zod";

import { VERIFICATION_STATUSES, type GuestId, type VerificationStatus } from "@/entities/guest";
import { routes } from "@/shared/routes";

const responseSchema = z.object({ status: z.enum(VERIFICATION_STATUSES) });

// The guest's status after the check, null when it failed; rejects with an AbortError when aborted.
export async function checkGuestWithAi(
  id: GuestId,
  signal: AbortSignal,
): Promise<VerificationStatus | null> {
  const response = await fetch(routes.guestAiVerification(id), { method: "POST", signal });
  if (!response.ok) {
    return null;
  }
  const body = responseSchema.safeParse(await response.json());
  return body.success ? body.data.status : null;
}
