"use client";

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
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { startSessionAction } from "../api/session-actions";

export function LoginForm({ config }: { config: FirebaseClientConfig }) {
  const [error, setError] = useState<string | null>(null);
  // Signed in, but the address is not confirmed yet: kept to resend the confirmation link.
  const [unverified, setUnverified] = useState<User | null>(null);
  const [resent, setResent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setError(null);
    setUnverified(null);
    setResent(false);

    startTransition(async () => {
      const auth = clientAuth(config);
      let idToken: string;
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        if (!user.emailVerified) {
          // The API would refuse the session anyway; say what to do instead.
          setUnverified(user);
          return;
        }
        idToken = await user.getIdToken();
        // The server keeps the session from here on; the SDK's copy is not needed.
        await signOut(auth);
      } catch (signInError) {
        setError(authErrorMessage(signInError));
        return;
      }
      // On success the action redirects to the signed-in home page and returns nothing.
      const result: Awaited<ReturnType<typeof startSessionAction>> | undefined =
        await startSessionAction(idToken);
      setError(result?.error ?? null);
    });
  }

  function resend() {
    if (!unverified) {
      return;
    }
    startTransition(async () => {
      try {
        await sendEmailVerification(unverified, continueUrl(routes.homeVerified()));
        setResent(true);
      } catch (resendError) {
        setError(authErrorMessage(resendError));
      }
    });
  }

  const describedBy = error ? "login-error" : undefined;

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="login-password">Hasło</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>

      <p id="login-error" role="alert" className="text-sm text-destructive empty:hidden">
        {error}
      </p>

      {unverified && (
        <div role="status" className="grid gap-2 rounded-lg bg-muted p-3 text-sm">
          <p>
            {resent
              ? `Wysłaliśmy nowy link na ${unverified.email}.`
              : "Najpierw potwierdź adres e-mail linkiem z wiadomości, którą wysłaliśmy po rejestracji."}
          </p>
          {!resent && (
            <Button
              type="button"
              variant="link"
              className="h-auto justify-self-start p-0"
              onClick={resend}
              disabled={pending}
            >
              Wyślij link ponownie
            </Button>
          )}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Logowanie…" : "Zaloguj się"}
      </Button>
    </form>
  );
}
