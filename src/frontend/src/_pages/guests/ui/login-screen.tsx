import { firebaseClientConfig } from "@/shared/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

import { LoginForm } from "./login-form";

/** Full-page sign-in, shown instead of the app to visitors without a session. */
export function LoginScreen() {
  const config = firebaseClientConfig();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>
            <h1 className="text-xl font-semibold tracking-tight">Zaproszenia</h1>
          </CardTitle>
          <CardDescription>Zaloguj się, aby zarządzać listą gości.</CardDescription>
        </CardHeader>
        <CardContent>
          {config ? (
            <LoginForm config={config} />
          ) : (
            <p role="alert" className="text-sm text-destructive">
              Logowanie jest wyłączone, a API nie rozpoznało użytkownika. Sprawdź DEV_AUTH_USER w
              konfiguracji API.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
