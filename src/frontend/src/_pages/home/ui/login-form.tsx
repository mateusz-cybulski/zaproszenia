"use client";

import type { FirebaseClientConfig } from "@/shared/config";
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
        <Label htmlFor="login-email" required>E-mail</Label>
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
        <Label htmlFor="login-password" required>Hasło</Label>
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
