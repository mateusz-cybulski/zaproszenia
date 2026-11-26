"use client";

import Link from "next/link";

import type { FirebaseClientConfig } from "@/shared/config";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useLogin } from "../model/use-login";

export function LoginForm({ config }: { config: FirebaseClientConfig }) {
  const { error, unconfirmedUser, resent, pending, submit, resend } = useLogin(config);
  const describedBy = error ? "login-error" : undefined;

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="login-email" required>
          E-mail
        </Label>
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
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="login-password" required>
            Hasło
          </Label>
          <Link
            href={routes.resetPassword()}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Nie pamiętasz hasła?
          </Link>
        </div>
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

      {unconfirmedUser && (
        <div role="status" className="grid gap-2 rounded-lg bg-muted p-3 text-sm">
          <p>
            {resent
              ? `Wysłaliśmy nowy link na ${unconfirmedUser.email}.`
              : "Najpierw potwierdź adres e-mail linkiem z wiadomości, którą wysłaliśmy po rejestracji."}
          </p>
          {!resent && (
            <Button
              type="button"
              variant="link"
              className="h-auto justify-self-start p-0"
              onClick={resend}
              aria-disabled={pending}
            >
              Wyślij link ponownie
            </Button>
          )}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" aria-disabled={pending}>
        {pending ? "Logowanie…" : "Zaloguj się"}
      </Button>
    </form>
  );
}
