import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { firebaseClientConfig } from "@/shared/config";
import { routes } from "@/shared/routes";
import { AuthCard } from "@/shared/ui/auth-card";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Rejestracja · Zaproszenia" };

export async function RegisterPage() {
  // FIREBASE_API_KEY exists only at runtime on Cloud Run, so render on every request.
  await connection();
  const config = firebaseClientConfig();
  if (!config) {
    // Sign-in is off locally (DEV_AUTH_USER): there is nothing to register for.
    redirect(routes.home());
  }

  return (
    <AuthCard title="Załóż konto" description="Zarejestruj się, aby tworzyć listy gości.">
      <RegisterForm config={config} />
      <p className="text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <Link href={routes.home()} className="text-foreground underline-offset-4 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </AuthCard>
  );
}
