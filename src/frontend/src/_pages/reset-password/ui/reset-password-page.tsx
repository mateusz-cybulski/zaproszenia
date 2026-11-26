import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { firebaseClientConfig } from "@/shared/config";
import { routes } from "@/shared/routes";
import { AuthCard } from "@/shared/ui/auth-card";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Nowe hasło · Zaproszenia" };

export async function ResetPasswordPage() {
  // FIREBASE_API_KEY exists only at runtime on Cloud Run, so render on every request.
  await connection();
  const config = firebaseClientConfig();
  if (!config) {
    // Sign-in is off locally (DEV_AUTH_USER): there is no password to reset.
    redirect(routes.home());
  }

  return (
    <AuthCard
      title="Nie pamiętasz hasła?"
      description="Podaj adres e-mail konta. Wyślemy link, którym ustawisz nowe hasło."
    >
      <ResetPasswordForm config={config} />
      <p className="text-center text-sm text-muted-foreground">
        Pamiętasz hasło?{" "}
        <Link href={routes.home()} className="text-foreground underline-offset-4 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </AuthCard>
  );
}
