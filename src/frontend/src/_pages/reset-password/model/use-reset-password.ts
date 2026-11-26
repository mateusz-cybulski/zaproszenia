import { sendPasswordResetEmail } from "firebase/auth";
import { type SubmitEvent, useState, useTransition } from "react";

import type { FirebaseClientConfig } from "@/shared/config";
import { authErrorMessage, clientAuth, continueUrl } from "@/shared/lib/firebase-auth";
import { routes } from "@/shared/routes";

export function useResetPassword(config: FirebaseClientConfig) {
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    setError(null);
    startTransition(async () => {
      try {
        // Succeeds for an unknown address too (email enumeration protection), so the page never
        // tells whether an account exists.
        await sendPasswordResetEmail(
          clientAuth(config),
          email,
          continueUrl(routes.homePasswordChanged()),
        );
        setSentTo(email);
      } catch (resetError) {
        setError(authErrorMessage(resetError));
      }
    });
  }

  return { error, sentTo, pending, submit };
}
