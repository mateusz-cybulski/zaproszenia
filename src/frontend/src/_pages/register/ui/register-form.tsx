"use client";

import type { FirebaseClientConfig } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { MIN_PASSWORD_LENGTH, useRegister } from "../model/use-register";
import { RegistrationSent } from "./registration-sent";

export function RegisterForm({ config }: { config: FirebaseClientConfig }) {
  const { error, sentTo, pending, submit } = useRegister(config);

  if (sentTo) {
    return <RegistrationSent email={sentTo} />;
  }

  const describedBy = error ? "register-error" : "register-password-hint";

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="register-email" required>
          E-mail
        </Label>
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
        <Label htmlFor="register-password" required>
          Hasło
        </Label>
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
        <Label htmlFor="register-password-repeat" required>
          Powtórz hasło
        </Label>
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

      <Button type="submit" size="lg" className="w-full" aria-disabled={pending}>
        {pending ? "Zakładanie konta…" : "Załóż konto"}
      </Button>
    </form>
  );
}
