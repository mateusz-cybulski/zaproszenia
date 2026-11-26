import Link from "next/link";

import { firebaseClientConfig } from "@/shared/config";
import { routes } from "@/shared/routes";
import { AuthCard } from "@/shared/ui/auth-card";

import { LoginForm } from "./login-form";

const NOTICES = {
  verified: "Adres e-mail potwierdzony. Możesz się zalogować.",
  "password-changed": "Hasło zmienione. Zaloguj się nowym hasłem.",
} as const;

export function LoginScreen({ notice }: { notice: keyof typeof NOTICES | null }) {
  const config = firebaseClientConfig();

  return (
    <AuthCard title="Zaproszenia" description="Zaloguj się, aby wygenerować zaproszenia.">
      {notice && (
        <p role="status" className="rounded-lg bg-muted p-3 text-sm">
          {NOTICES[notice]}
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
          <p className="text-center text-sm">
            <Link
              href={routes.instructionPolish()}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Instrukcja obsługi
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
