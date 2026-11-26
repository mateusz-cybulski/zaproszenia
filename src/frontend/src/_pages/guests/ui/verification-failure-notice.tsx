"use client";

import { type Guest, verificationFailureReason } from "@/entities/guest";
import { useAction } from "@/shared/lib/action-call";
import { Button } from "@/shared/ui/button";

import { verifyGuestWithAiAction } from "../api/verify-guest-with-ai-action";

// Like the event's readiness notice: what went wrong and the way to fix it, nothing otherwise.
export function VerificationFailureNotice({ guest }: { guest: Guest }) {
  const retry = useAction(() => verifyGuestWithAiAction(guest.id));
  if (guest.verificationStatus !== "failed") {
    return null;
  }
  return (
    <section
      aria-labelledby="verification-failure-title"
      className="mb-6 grid gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm"
    >
      <h3 id="verification-failure-title" className="font-medium">
        Weryfikacja AI nie powiodła się
      </h3>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span>{retry.error ?? verificationFailureReason(guest.verificationResult)}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          pending={retry.pending}
          onClick={() => retry.run()}
        >
          {retry.pending ? "Sprawdzanie…" : "Spróbuj ponownie"}
        </Button>
      </div>
    </section>
  );
}
