"use client";

import { ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";

import { useAction } from "@/shared/lib/action-call";
import { Button } from "@/shared/ui/button";
import { ChoiceButton } from "@/shared/ui/choice-button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { verifyAllGuestsManuallyAction } from "../api/verify-all-guests-manually-action";
import { AI_RUN_COPY } from "../config/ai-run-copy";
import { useAiVerificationRun } from "../model/use-ai-verification-run";
import { AiRunProgress } from "./ai-run-progress";

export function VerifyAllDialog() {
  const [open, setOpen] = useState(false);
  const { run, pending, error, setError } = useAction(verifyAllGuestsManuallyAction, {
    onSuccess: () => changeOpen(false),
  });

  const aiRun = useAiVerificationRun();

  // Closing stops a running check; guests already checked keep their result.
  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    setError(null);
    if (!nextOpen) {
      aiRun.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShieldCheck /> Zweryfikuj wszystkich
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jak zweryfikować dane?</DialogTitle>
          <DialogDescription>
            Wszyscy goście, którzy nie są jeszcze zweryfikowani.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {aiRun.state !== "idle" ? (
            <AiRunProgress run={aiRun} onClose={() => changeOpen(false)} />
          ) : (
            <div className="grid gap-3">
              <ChoiceButton
                icon={Sparkles}
                title={AI_RUN_COPY.choiceTitle}
                description={AI_RUN_COPY.choiceDescription}
                onClick={() => void aiRun.start()}
              />
              <ChoiceButton
                icon={UserCheck}
                title="Zatwierdź ręcznie"
                description="Dane są poprawne: sprawdziłeś je sam i nie potrzebujesz AI."
                pending={pending}
                disabled={pending}
                onClick={() => run()}
              />
              {(error ?? aiRun.error) && (
                <p role="alert" className="text-sm text-destructive">
                  {error ?? aiRun.error}
                </p>
              )}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
