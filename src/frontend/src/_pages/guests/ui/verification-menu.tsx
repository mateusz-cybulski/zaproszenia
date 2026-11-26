"use client";

import { ChevronDown, ListChecks, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";

import {
  type Guest,
  VerificationBadge,
  verificationFailureReason,
  VERIFICATION_STATUS_LABELS,
} from "@/entities/guest";
import { useAction } from "@/shared/lib/action-call";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { verifyGuestManuallyAction } from "../api/verify-guest-manually-action";
import { verifyGuestWithAiAction } from "../api/verify-guest-with-ai-action";
import { AiReviewDialog } from "./ai-review-dialog";
import { MenuOption } from "./menu-option";

export function VerificationMenu({ guest }: { guest: Guest }) {
  const [reviewing, setReviewing] = useState(false);
  const verify = useAction(() => verifyGuestManuallyAction(guest.id));
  // After a check with remarks the review opens; without remarks the badge says it is done.
  const verifyWithAi = useAction(() => verifyGuestWithAiAction(guest.id), {
    onSuccess: () => setReviewing(true),
  });
  const pending = verify.pending || verifyWithAi.pending;
  const error = verify.error ?? verifyWithAi.error;
  const label = VERIFICATION_STATUS_LABELS[guest.verificationStatus];

  return (
    <div className="grid justify-items-start gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={pending}
          className="inline-flex items-center gap-0.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={`Weryfikacja: ${label}. Zmień`}
        >
          <VerificationBadge
            status={guest.verificationStatus}
            busy={pending}
            className="hover:opacity-80"
          />
          {!pending && <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {label}
            {guest.verificationStatus === "failed" && (
              <span className="mt-1 block text-destructive">
                {verificationFailureReason(guest.verificationResult)}
              </span>
            )}
          </DropdownMenuLabel>
          {guest.verificationStatus === "needs_review" && (
            <DropdownMenuItem onSelect={() => setReviewing(true)}>
              <MenuOption
                icon={ListChecks}
                title="Przejrzyj wynik AI"
                description="Przyjmij albo odrzuć poprawki"
              />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => verifyWithAi.run()}>
            <MenuOption
              icon={Sparkles}
              title="Zweryfikuj z AI"
              description="Tytuły, nazwy, adres i zwrot grzecznościowy"
            />
          </DropdownMenuItem>
          {guest.verificationStatus !== "verified_manual" && (
            <DropdownMenuItem onSelect={() => verify.run()}>
              <MenuOption
                icon={UserCheck}
                title="Zatwierdź ręcznie"
                description="Dane są poprawne, bez sprawdzania AI"
              />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <AiReviewDialog
        guest={guest}
        open={reviewing && guest.verificationStatus === "needs_review"}
        onOpenChange={setReviewing}
      />
    </div>
  );
}
