import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { type FormEvent, useState, useTransition } from "react";

import type { FirebaseClientConfig } from "@/shared/config";
import { authErrorMessage, clientAuth, continueUrl } from "@/shared/lib/firebase-auth";
import { routes } from "@/shared/routes";

import { startSessionAction } from "../api/session-actions";

export function useLogin(config: FirebaseClientConfig) {
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedUser, setUnconfirmedUser] = useState<User | null>(null);
  const [resent, setResent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setError(null);
    setUnconfirmedUser(null);
    setResent(false);

    startTransition(async () => {
      const auth = clientAuth(config);
      let idToken: string;
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        if (!user.emailVerified) {
          setUnconfirmedUser(user);
          return;
        }
        idToken = await user.getIdToken();
        // The server keeps the session from here on; the SDK's copy is not needed.
        await signOut(auth);
      } catch (signInError) {
        setError(authErrorMessage(signInError));
        return;
      }
      // On success the action redirects to the guest list and returns nothing.
      const result: Awaited<ReturnType<typeof startSessionAction>> | undefined =
        await startSessionAction(idToken);
      setError(result?.error ?? null);
    });
  }

  function resend() {
    if (!unconfirmedUser) {
      return;
    }
    startTransition(async () => {
      try {
        await sendEmailVerification(unconfirmedUser, continueUrl(routes.homeVerified()));
        setResent(true);
      } catch (resendError) {
        setError(authErrorMessage(resendError));
      }
    });
  }

  return { error, unconfirmedUser, resent, pending, submit, resend };
}
