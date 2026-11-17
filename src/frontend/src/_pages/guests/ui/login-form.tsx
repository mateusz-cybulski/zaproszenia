"use client";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { type FormEvent, useState, useTransition } from "react";

import type { FirebaseClientConfig } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { startSessionAction } from "../api/session-actions";
import { clientAuth, signInErrorMessage } from "../lib/firebase";

export function LoginForm({ config }: { config: FirebaseClientConfig }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setError(null);

    startTransition(async () => {
      const auth = clientAuth(config);
      let idToken: string;
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        idToken = await user.getIdToken();
        // The server keeps the session from here on; the SDK's copy is not needed.
        await signOut(auth);
      } catch (signInError) {
        setError(signInErrorMessage(signInError));
        return;
      }
      // On success the action redirects to the signed-in home page and returns nothing.
      const result: Awaited<ReturnType<typeof startSessionAction>> | undefined =
        await startSessionAction(idToken);
      setError(result?.error ?? null);
    });
  }

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
          aria-describedby={error ? "login-error" : undefined}
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
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>

      <p id="login-error" role="alert" className="text-sm text-destructive empty:hidden">
        {error}
      </p>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Logowanie…" : "Zaloguj się"}
      </Button>
    </form>
  );
}
