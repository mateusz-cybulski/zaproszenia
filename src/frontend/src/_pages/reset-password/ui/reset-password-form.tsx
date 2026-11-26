"use client";

import Link from "next/link";

import type { FirebaseClientConfig } from "@/shared/config";
import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useResetPassword } from "../model/use-reset-password";

export function ResetPasswordForm({ config }: { config: FirebaseClientConfig }) {
  const { error, sentTo, pending, submit } = useResetPassword(config);

  if (sentTo) {
    return (
      <div role="status" className="grid gap-4 text-sm">
        <p>
          Jeśli konto z adresem <strong>{sentTo}</strong> istnieje, wysłaliśmy na nie link do
          ustawienia nowego hasła.
        </p>
        <p className="text-muted-foreground">Nie widzisz wiadomości? Sprawdź folder ze spamem.</p>
        <Button asChild size="lg" className="w-full">
          <Link href={routes.home()}>Wróć do logowania</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="reset-email" required>
          E-mail
        </Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "reset-error" : undefined}
        />
      </div>

      <p id="reset-error" role="alert" className="text-sm text-destructive empty:hidden">
        {error}
      </p>

      <Button type="submit" size="lg" className="w-full" pending={pending}>
        {pending ? "Wysyłanie…" : "Wyślij link"}
      </Button>
    </form>
  );
}
