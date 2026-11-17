import Link from "next/link";

import { firebaseClientConfig } from "@/shared/config";
import { routes } from "@/shared/routes";
import { AuthCard } from "@/shared/ui/auth-card";

import { LoginForm } from "./login-form";

export function LoginScreen({ verified }: { verified: boolean }) {
  const config = firebaseClientConfig();

  return (
    <AuthCard title="Zaproszenia" description="Zaloguj się, aby zarządzać listą gości.">
      {verified && (
        <p role="status" className="rounded-lg bg-muted p-3 text-sm">
          Adres e-mail potwierdzony. Możesz się zalogować.
        </p>
      )}
      {config ? (
        <>
          <LoginForm config={config} />
          <p className="text-center text-sm text-muted-foreground">
            Nie masz konta?{" "}
            <Link
              href={routes.register()}
              className="text-foreground underline-offset-4 hover:underline"
            >
              Zarejestruj się
            </Link>
          </p>
        </>
      ) : (
        <p role="alert" className="text-sm text-destructive">
          Logowanie jest wyłączone, a API nie rozpoznało użytkownika. Sprawdź DEV_AUTH_USER w
          konfiguracji API.
        </p>
      )}
    </AuthCard>
  );
}
