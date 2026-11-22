import { parseGuestId } from "@/entities/guest";
import { verifyGuestWithAi } from "@/entities/guest/index.server";

type GuestAiVerificationContext = { params: Promise<{ id: string }> };

// A route, not a Server Action: the browser checks several guests at once and can abort them,
// while Server Actions from one page run one after another and cannot be cancelled.
export async function postGuestAiVerification(
  _request: Request,
  { params }: GuestAiVerificationContext,
) {
  const guestId = parseGuestId((await params).id);
  if (guestId === null) {
    return new Response(null, { status: 404 });
  }
  const guest = await verifyGuestWithAi(guestId);
  if (!guest) {
    return new Response(null, { status: 502 });
  }
  return Response.json(
    { status: guest.verificationStatus },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
