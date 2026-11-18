"use client";

import { ChevronDown, Sparkles, UserCheck } from "lucide-react";
import { useState, useTransition } from "react";

import { type Guest, VerificationBadge, verificationStatusLabels } from "@/entities/guest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { verifyGuestManuallyAction } from "../api/actions";
import { MenuOption } from "./menu-option";

export function VerificationMenu({ guest }: { guest: Guest }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const label = verificationStatusLabels[guest.verificationStatus];

  function verifyManually() {
    startTransition(async () => {
      setError((await verifyGuestManuallyAction(guest.id)).error ?? null);
    });
  }

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
            className="cursor-pointer hover:opacity-80"
          />
          {!pending && <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {label}
          </DropdownMenuLabel>
          <DropdownMenuItem disabled>
            <MenuOption icon={Sparkles} title="Zweryfikuj z AI" description="Dostępne wkrótce" />
          </DropdownMenuItem>
          {guest.verificationStatus !== "verified_manual" && (
            <DropdownMenuItem onSelect={verifyManually}>
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
    </div>
  );
}
