"use client";

import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";

import type { FirebaseClientConfig } from "@/shared/config";
import { authErrorMessage, clientAuth, continueUrl } from "@/shared/lib/firebase-auth";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm({ config }: { config: FirebaseClientConfig }) {
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const repeated = String(form.get("password-repeat") ?? "");
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`);
      return;
    }
    if (password !== repeated) {
      setError("Hasła różnią się.");
      return;
    }

    startTransition(async () => {
      const auth = clientAuth(config);
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        // Sign-in needs a confirmed address; the link brings the user back to sign in.
        await sendEmailVerification(user, continueUrl(routes.homeVerified()));
        await signOut(auth);
        setSentTo(email);
      } catch (signUpError) {
        setError(authErrorMessage(signUpError));
      }
    });
  }

  if (sentTo) {
    return (
      <div role="status" className="grid gap-4 text-sm">
        <p>
          Konto założone. Wysłaliśmy link potwierdzający na <strong>{sentTo}</strong>. Kliknij go, a
          potem zaloguj się.
        </p>
        <p className="text-muted-foreground">Nie widzisz wiadomości? Sprawdź folder ze spamem.</p>
        <Button asChild size="lg" className="w-full">
          <Link href={routes.home()}>Przejdź do logowania</Link>
        </Button>
      </div>
    );
  }

  const describedBy = error ? "register-error" : "register-password-hint";

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="register-email">E-mail</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "register-error" : undefined}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-password">Hasło</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <p id="register-password-hint" className="text-sm text-muted-foreground">
          Co najmniej {MIN_PASSWORD_LENGTH} znaków.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-password-repeat">Powtórz hasło</Label>
        <Input
          id="register-password-repeat"
          name="password-repeat"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "register-error" : undefined}
        />
      </div>

      <p id="register-error" role="alert" className="text-sm text-destructive empty:hidden">
        {error}
      </p>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Zakładanie konta…" : "Załóż konto"}
      </Button>
    </form>
  );
}
